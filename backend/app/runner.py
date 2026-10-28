import asyncio
import json
import logging
import os
import subprocess
import threading
from typing import AsyncGenerator, Dict, Any, Optional
from .config import AGY_BIN

logger = logging.getLogger("agent_office.runner")

# Global dict to track active subprocesses for cancellation
ACTIVE_PROCESSES: Dict[str, subprocess.Popen] = {}


async def cancel_run(run_id: str) -> bool:
    """Cancels a running subprocess if active"""
    proc = ACTIVE_PROCESSES.get(run_id)
    if proc and proc.poll() is None:
        try:
            proc.terminate()
            await asyncio.sleep(0.5)
            if proc.poll() is None:
                proc.kill()
            return True
        except Exception as e:
            logger.error(f"Error terminating process {run_id}: {e}")
    return False


async def execute_agy_turn(
    run_id: str,
    prompt: str,
    cwd: str,
    effort: str = "medium",
    model: Optional[str] = None,
    agent_id: str = "agent",
    agent_name: str = "Agent",
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Executes an agy CLI turn in the specified working directory,
    reading stream-json NDJSON lines from stdout in real time,
    and yielding parsed events for SSE.
    Uses threaded piping to guarantee 100% compatibility on Windows under any event loop.
    """
    # Pipe prompt via stdin with --input-format text to bypass Windows 32,767-char command line limit ([WinError 206])
    cmd = [
        AGY_BIN,
        "--input-format", "text",
        "--output-format", "stream-json",
        "--dangerously-skip-permissions",
    ]
    if model and model != "default":
        clean_model = model
        # If effort is explicitly set, strip any redundant suffix from model
        if effort and effort != "auto":
            for suf in ("-high", "-medium", "-low"):
                if clean_model.endswith(suf):
                    clean_model = clean_model[:-len(suf)]
                    break
        cmd.extend(["--model", clean_model])
    if effort and effort != "auto":
        cmd.extend(["--effort", effort])

    logger.info(
        f"Starting agy run {run_id} in {cwd} for {agent_name} "
        f"(model: {model or 'default'}, effort: {effort or 'medium'}, prompt length: {len(prompt)} chars)"
    )

    q: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    proc: Optional[subprocess.Popen] = None

    try:
        proc = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,  # Line buffered
        )
        ACTIVE_PROCESSES[run_id] = proc

        # Feed prompt to stdin in background thread to avoid deadlocks
        def stdin_writer():
            try:
                if proc and proc.stdin:
                    proc.stdin.write(prompt)
                    proc.stdin.flush()
                    proc.stdin.close()
            except Exception as ex:
                logger.warning(f"Error feeding stdin to {run_id}: {ex}")

        threading.Thread(target=stdin_writer, daemon=True).start()

        def stdout_reader():
            try:
                for line in iter(proc.stdout.readline, ''):
                    if not line:
                        break
                    loop.call_soon_threadsafe(q.put_nowait, ("stdout", line.strip()))
            except Exception as e:
                loop.call_soon_threadsafe(q.put_nowait, ("error", str(e)))
            finally:
                proc.stdout.close()
                loop.call_soon_threadsafe(q.put_nowait, (None, None))

        def stderr_reader():
            try:
                for line in iter(proc.stderr.readline, ''):
                    if not line:
                        break
                    loop.call_soon_threadsafe(q.put_nowait, ("stderr", line.strip()))
            except Exception:
                pass
            finally:
                proc.stderr.close()

        threading.Thread(target=stdout_reader, daemon=True).start()
        threading.Thread(target=stderr_reader, daemon=True).start()

        accumulated_text = ""

        while True:
            try:
                source, line_content = await asyncio.wait_for(q.get(), timeout=3.0)
            except asyncio.TimeoutError:
                if proc and proc.poll() is not None and q.empty():
                    break
                # Keep-alive ping so proxy/browser connection never times out during thinking
                yield {
                    "run_id": run_id,
                    "step": "ping",
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                }
                continue

            if source is None:
                break

            if source == "stderr":
                if line_content and "error" in line_content.lower():
                    yield {
                        "run_id": run_id,
                        "step": "stderr",
                        "agent_id": agent_id,
                        "agent_name": agent_name,
                        "content": line_content,
                    }
                continue

            if not line_content:
                continue

            try:
                data = json.loads(line_content)
            except json.JSONDecodeError:
                yield {
                    "run_id": run_id,
                    "step": "stdout",
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "content": line_content + "\n",
                }
                continue

            event_type = data.get("event")

            # 1. Init Event
            if event_type == "init":
                init_info = data.get("init", {})
                yield {
                    "run_id": run_id,
                    "step": "init",
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "metadata": {
                        "conversation_id": data.get("conversation_id"),
                        "tools": init_info.get("tools", []),
                        "cwd": init_info.get("cwd"),
                    },
                }

            # 2. Step Update Event
            elif event_type == "step_update":
                step_data = data.get("step_update", {})
                step_type = step_data.get("step_type")
                state = step_data.get("state")

                # Text / Response delta
                if step_type == "agent_response":
                    text_delta = step_data.get("text_delta")
                    usage = step_data.get("usage", {})
                    thinking_tokens = usage.get("thinking_tokens", 0)

                    if text_delta:
                        accumulated_text += text_delta
                        yield {
                            "run_id": run_id,
                            "step": "stdout",
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "content": text_delta,
                        }

                    # Emit token usage if reported in step
                    if usage and usage.get("total_tokens"):
                        yield {
                            "run_id": run_id,
                            "step": "token_usage",
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "usage": {
                                "input_tokens": usage.get("input_tokens", 0),
                                "output_tokens": usage.get("output_tokens", 0),
                                "thinking_tokens": usage.get("thinking_tokens", 0),
                                "total_tokens": usage.get("total_tokens", 0),
                            },
                        }

                    # If usage shows thinking
                    if thinking_tokens > 0 and state == "DONE":
                        yield {
                            "run_id": run_id,
                            "step": "thinking",
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "metadata": {
                                "thinking_tokens": thinking_tokens,
                                "duration_seconds": step_data.get("duration_seconds", 0),
                            },
                        }

                # Tool Execution
                elif step_type == "tool":
                    tool_name = step_data.get("tool_name")
                    tool_info = step_data.get("tool_info", {})
                    duration = step_data.get("duration_seconds", 0)

                    if state == "ACTIVE":
                        yield {
                            "run_id": run_id,
                            "step": "tool_call",
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "tool": tool_name,
                            "parameters": tool_info.get("parameters", {}),
                            "state": "ACTIVE",
                        }
                    elif state == "DONE":
                        yield {
                            "run_id": run_id,
                            "step": "tool_result",
                            "agent_id": agent_id,
                            "agent_name": agent_name,
                            "tool": tool_name,
                            "parameters": tool_info.get("parameters", {}),
                            "duration_seconds": duration,
                            "state": "DONE",
                        }

            # 3. Final Result Event
            elif event_type == "result":
                res = data.get("result", {})
                status = res.get("status", "SUCCESS")
                full_resp = res.get("response") or accumulated_text
                usage = res.get("usage", {})

                if usage and usage.get("total_tokens"):
                    yield {
                        "run_id": run_id,
                        "step": "token_usage",
                        "agent_id": agent_id,
                        "agent_name": agent_name,
                        "usage": {
                            "input_tokens": usage.get("input_tokens", 0),
                            "output_tokens": usage.get("output_tokens", 0),
                            "thinking_tokens": usage.get("thinking_tokens", 0),
                            "total_tokens": usage.get("total_tokens", 0),
                        },
                    }

                yield {
                    "run_id": run_id,
                    "step": "result",
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "status": status,
                    "content": full_resp,
                    "duration_seconds": res.get("duration_seconds", 0),
                    "usage": usage,
                }

        # Wait for process exit
        proc.wait()

    except asyncio.CancelledError:
        logger.warning(f"Run {run_id} was cancelled by user")
        if proc and proc.poll() is None:
            proc.kill()
        yield {
            "run_id": run_id,
            "step": "error",
            "agent_id": agent_id,
            "agent_name": agent_name,
            "content": "Execution was cancelled.",
        }
        raise
    except Exception as e:
        logger.error(f"Error in agy execution {run_id}: {e}", exc_info=True)
        yield {
            "run_id": run_id,
            "step": "error",
            "agent_id": agent_id,
            "agent_name": agent_name,
            "content": f"Subprocess error: {str(e)}",
        }
    finally:
        ACTIVE_PROCESSES.pop(run_id, None)
