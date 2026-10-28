import asyncio
import json
import uuid
import logging
from typing import AsyncGenerator, Dict, Any, List
from .models import AgentRole, WorkflowMode, RunRequest
from .roles import ROLES_METADATA, get_role_system_prompt, sync_roles_metadata_from_db
from .project_manager import get_project_path
from .runner import execute_agy_turn

logger = logging.getLogger("agent_office.orchestrator")


async def orchestrate_run(request: RunRequest) -> AsyncGenerator[str, None]:
    """
    Orchestrates the agent execution based on the requested mode:
    - Pipeline (CEO -> PM -> Designer -> [Approval] -> Architect -> DB -> Backend -> Frontend -> Security -> QA)
    - Meeting (Full team roundtable discussion)
    - Single (Direct agent prompt)

    Yields formatted SSE strings: "data: {...}\n\n"
    """
    sync_roles_metadata_from_db()
    run_id = f"run-{uuid.uuid4().hex[:8]}"
    project_path = get_project_path(request.project_id)
    project_dir = str(project_path)
    project_name = request.project_id.replace("-", " ").title()

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'run_start', 'mode': request.mode, 'project_id': request.project_id, 'project_dir': project_dir})}\n\n"

    try:
        if request.mode == WorkflowMode.PIPELINE:
            async for sse in run_pipeline(run_id, request, project_name, project_dir):
                yield sse

        elif request.mode == WorkflowMode.MAINTENANCE:
            async for sse in run_maintenance(run_id, request, project_name, project_dir):
                yield sse

        elif request.mode == WorkflowMode.MEETING:
            async for sse in run_meeting(run_id, request, project_name, project_dir):
                yield sse

        elif request.mode == WorkflowMode.SINGLE:
            async for sse in run_single(run_id, request, project_name, project_dir):
                yield sse

        yield f"data: {json.dumps({'run_id': run_id, 'step': 'run_complete', 'status': 'SUCCESS'})}\n\n"

    except Exception as e:
        logger.error(f"Orchestration failure in {run_id}: {e}", exc_info=True)
        yield f"data: {json.dumps({'run_id': run_id, 'step': 'error', 'content': str(e)})}\n\n"


async def run_pipeline(
    run_id: str, request: RunRequest, project_name: str, project_dir: str
) -> AsyncGenerator[str, None]:
    """
    Real software company pipeline:
    Leadership & Product:
      - CEO: Vision & Business Scope
      - PM: User Stories & Requirements
      - Designer: UI/UX Specs & Wireframes
      [Optional Human Approval Gate]
    Engineering & Dev:
      - Architect: System Topology & Tech Blueprint
      - Database: Schema, Tables & Entity Models
      - Backend: API Routes, Controllers & Logic
      - Frontend: Responsive UI, Components & State
    Assurance & Operations:
      - Security: DevSecOps Vulnerability Audit & Hardening
      - QA: Verification, Syntax Inspection & Run Guide
      - Maintenance: Handover, Baseline Indexing & Change Coordinator Standby
    """

    all_steps = [
        (AgentRole.CEO, "Phase 1: Executive Vision & Scoping"),
        (AgentRole.PM, "Phase 2: Product & Feature Specifications"),
        (AgentRole.DESIGNER, "Phase 3: UI/UX Design System & Wireframes"),
        (AgentRole.ARCHITECT, "Phase 4: System Architecture & Technical Blueprint"),
        (AgentRole.DATABASE, "Phase 5: Database Schema & Entity Models"),
        (AgentRole.BACKEND, "Phase 6: Server API Logic & Routing"),
        (AgentRole.FRONTEND, "Phase 7: Client Interface & Component Implementation"),
        (AgentRole.SECURITY, "Phase 8: Security Audit & Code Hardening"),
        (AgentRole.QA, "Phase 9: Quality Assurance & Delivery Gate"),
        (AgentRole.MAINTENANCE, "Phase 10: Operational Handover & Active Maintenance Readiness"),
    ]

    is_resume_after_design = request.start_phase == "after_design"
    is_custom_resume = request.resume_from_role is not None

    if is_custom_resume and request.resume_from_role:
        target_idx = 0
        for idx, (step_role, _) in enumerate(all_steps):
            if step_role == request.resume_from_role or step_role.value == request.resume_from_role:
                target_idx = idx
                break
        pipeline_steps = all_steps[target_idx:]
    elif is_resume_after_design:
        pipeline_steps = all_steps[3:]  # Start from Architect
    else:
        pipeline_steps = all_steps

    accumulated_context: Dict[AgentRole, str] = {}

    # Seed previous deliverables if provided from frontend checkpoint
    if request.previous_deliverables:
        for r_key, deliverable_text in request.previous_deliverables.items():
            for role_enum in AgentRole:
                if role_enum.value == r_key:
                    accumulated_context[role_enum] = deliverable_text

    # Seed design spec if resuming after design review
    if is_resume_after_design and request.design_spec:
        accumulated_context[AgentRole.DESIGNER] = request.design_spec

    for role, phase_title in pipeline_steps:
        role_info = ROLES_METADATA.get(role)
        if not role_info:
            continue

        sys_prompt = get_role_system_prompt(role, project_name, project_dir)
        active_model = request.model or getattr(role_info, "model", "default")
        active_effort = request.effort or getattr(role_info, "effort", "medium")

        yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': phase_title, 'agent_id': role.value, 'agent_name': role_info.name, 'role_title': role_info.title, 'avatar': role_info.avatar, 'color': role_info.color, 'model': active_model, 'effort': active_effort})}\n\n"

        # Build prompt incorporating previous roles' outputs
        prompt_parts = [
            f"=== SYSTEM ROLE INSTRUCTIONS ===\n{sys_prompt}\n",
            f"=== USER PROJECT GOAL ===\n{request.prompt}\n",
        ]

        # In resume mode, inject user feedback or correction notes
        if request.user_feedback:
            prompt_parts.append(f"=== CLIENT DIRECTIVES / RESUMPTION INSTRUCTIONS ===\n{request.user_feedback}\n")

        # Handover chains
        if role == AgentRole.PM and AgentRole.CEO in accumulated_context:
            prompt_parts.append(f"=== CEO EXECUTIVE BRIEF ===\n{accumulated_context[AgentRole.CEO]}\n")

        elif role == AgentRole.DESIGNER:
            if AgentRole.CEO in accumulated_context:
                prompt_parts.append(f"=== CEO EXECUTIVE BRIEF ===\n{accumulated_context[AgentRole.CEO]}\n")
            if AgentRole.PM in accumulated_context:
                prompt_parts.append(f"=== PM PRODUCT SPECIFICATION ===\n{accumulated_context[AgentRole.PM]}\n")

        elif role == AgentRole.ARCHITECT:
            if AgentRole.PM in accumulated_context:
                prompt_parts.append(f"=== PM PRODUCT SPECIFICATION ===\n{accumulated_context[AgentRole.PM]}\n")
            if AgentRole.DESIGNER in accumulated_context:
                prompt_parts.append(f"=== UI/UX DESIGN SPECIFICATIONS & WIREFRAMES ===\n{accumulated_context[AgentRole.DESIGNER]}\n")

        elif role == AgentRole.DATABASE:
            if AgentRole.ARCHITECT in accumulated_context:
                prompt_parts.append(f"=== SYSTEM ARCHITECT BLUEPRINT ===\n{accumulated_context[AgentRole.ARCHITECT]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Define all database schemas, models, or migration/seed files and write them directly into {project_dir} using your file writing tools."
            )

        elif role == AgentRole.BACKEND:
            if AgentRole.ARCHITECT in accumulated_context:
                prompt_parts.append(f"=== SYSTEM ARCHITECT BLUEPRINT ===\n{accumulated_context[AgentRole.ARCHITECT]}\n")
            if AgentRole.DATABASE in accumulated_context:
                prompt_parts.append(f"=== DATABASE SCHEMA DELIVERABLE ===\n{accumulated_context[AgentRole.DATABASE]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Implement the backend server code, API routes, and database connectors. Write files directly into {project_dir} using your file writing tools."
            )

        elif role == AgentRole.FRONTEND:
            if AgentRole.ARCHITECT in accumulated_context:
                prompt_parts.append(f"=== SYSTEM ARCHITECT BLUEPRINT ===\n{accumulated_context[AgentRole.ARCHITECT]}\n")
            if AgentRole.DESIGNER in accumulated_context:
                prompt_parts.append(f"=== UI/UX DESIGN TOKENS & WIREFRAMES ===\n{accumulated_context[AgentRole.DESIGNER]}\n")
            if AgentRole.BACKEND in accumulated_context:
                prompt_parts.append(f"=== BACKEND API ROUTES & SPECIFICATION ===\n{accumulated_context[AgentRole.BACKEND]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Implement modern, clean client views, styling, and interactivity based directly on Maya Lin's wireframes and Marcus's architecture. Write frontend files directly into {project_dir} using your file writing tools."
            )

        elif role == AgentRole.SECURITY:
            if AgentRole.ARCHITECT in accumulated_context:
                prompt_parts.append(f"=== SYSTEM ARCHITECT BLUEPRINT ===\n{accumulated_context[AgentRole.ARCHITECT]}\n")
            if AgentRole.BACKEND in accumulated_context:
                prompt_parts.append(f"=== BACKEND IMPLEMENTATION SUMMARY ===\n{accumulated_context[AgentRole.BACKEND]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Inspect all source files generated in {project_dir}. "
                f"Check for OWASP Top 10 vulnerabilities (XSS, SQL injection, sensitive variable leaks). Hardcode fixes if necessary and generate your Security Audit Certificate."
            )

        elif role == AgentRole.QA:
            if AgentRole.PM in accumulated_context:
                prompt_parts.append(f"=== PM ACCEPTANCE CRITERIA & SPECS ===\n{accumulated_context[AgentRole.PM]}\n")
            if AgentRole.ARCHITECT in accumulated_context:
                prompt_parts.append(f"=== SYSTEM ARCHITECT BLUEPRINT ===\n{accumulated_context[AgentRole.ARCHITECT]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Inspect all files in {project_dir}. "
                f"Verify code quality, syntax, completeness against acceptance criteria, and give the user step-by-step instructions on how to run this project."
            )

        elif role == AgentRole.MAINTENANCE:
            if AgentRole.QA in accumulated_context:
                prompt_parts.append(f"=== QA RELEASE & RUN GUIDE ===\n{accumulated_context[AgentRole.QA]}\n")
            prompt_parts.append(
                f"\nIMPORTANT ACTION REQUIRED:\n"
                f"Inspect all finalized files in {project_dir}. "
                f"Register the project into active maintenance, establish the operational baseline, and announce readiness to handle future user change requests and cross-team coordination."
            )

        turn_prompt = "\n".join(prompt_parts)
        role_result = ""

        async for event in execute_agy_turn(
            run_id=run_id,
            prompt=turn_prompt,
            cwd=project_dir,
            effort=active_effort,
            model=active_model,
            agent_id=role.value,
            agent_name=role_info.name,
        ):
            if event.get("step") == "result":
                role_result = event.get("content", "")
            elif event.get("step") == "stdout" and not role_result:
                role_result += event.get("content", "")

            yield f"data: {json.dumps(event)}\n\n"

        accumulated_context[role] = role_result
        yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': role.value, 'agent_name': role_info.name})}\n\n"

        # Check for UX/UI Design Approval Gate (Pauses pipeline for user review)
        should_pause_for_design = True if request.require_design_approval is None else request.require_design_approval
        if role == AgentRole.DESIGNER and should_pause_for_design and not is_resume_after_design:
            yield f"data: {json.dumps({'run_id': run_id, 'step': 'approval_required', 'phase': 'UI/UX Design Review Gate', 'agent_id': role.value, 'agent_name': role_info.name, 'role_title': role_info.title, 'design_deliverable': role_result, 'message': 'Maya Lin has completed the UI/UX Specifications and Wireframes. Please review and approve to dispatch the Engineering & QA departments.'})}\n\n"
            # Pause pipeline here for user approval
            return


async def run_meeting(
    run_id: str, request: RunRequest, project_name: str, project_dir: str
) -> AsyncGenerator[str, None]:
    """Roundtable executive boardroom discussion between all 10 company roles"""
    meeting_order = [
        (AgentRole.CEO, "Opening Vision & Business Opportunity"),
        (AgentRole.PM, "Product Strategy & User Acceptance Metrics"),
        (AgentRole.DESIGNER, "User Experience, Ergonomics & Brand System"),
        (AgentRole.ARCHITECT, "Technical Architecture & System Feasibility"),
        (AgentRole.DATABASE, "Data Strategy, Schemas & Storage Performance"),
        (AgentRole.BACKEND, "Server Architecture & API Scalability"),
        (AgentRole.FRONTEND, "Client Experience, Responsive Design & Web Standards"),
        (AgentRole.SECURITY, "Threat Modeling, Risk Assessment & Security Policies"),
        (AgentRole.QA, "Release Readiness, Test Automation & Quality Bar"),
        (AgentRole.MAINTENANCE, "Post-Release Maintainability, SLA & Incident Response"),
        (AgentRole.CEO, "Executive Synthesis & Strategic Marching Orders"),
    ]

    meeting_notes: List[str] = []

    for role, topic in meeting_order:
        role_info = ROLES_METADATA.get(role)
        if not role_info:
            continue

        phase_title = f"{role_info.name} ({role_info.title}) - {topic}"
        active_model = request.model or getattr(role_info, "model", "default")
        active_effort = request.effort or getattr(role_info, "effort", "low")

        yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': phase_title, 'agent_id': role.value, 'agent_name': role_info.name, 'role_title': role_info.title, 'avatar': role_info.avatar, 'color': role_info.color, 'model': active_model, 'effort': active_effort})}\n\n"

        prompt_parts = [
            f"You are {role_info.name}, {role_info.title} at Agent Office.",
            f"Topic for today's Executive Boardroom Meeting: {request.prompt}",
            f"Your specific agenda for this turn: {topic}.",
            "Maintain your character. Speak concisely, offer practical solutions, challenge assumptions respectfully, and be direct and impactful.",
        ]

        if meeting_notes:
            prompt_parts.append("\n=== PREVIOUS DISCUSSION IN THE MEETING ===")
            prompt_parts.extend(meeting_notes[-4:])  # Keep recent context crisp

        turn_prompt = "\n".join(prompt_parts)
        speech = ""

        async for event in execute_agy_turn(
            run_id=run_id,
            prompt=turn_prompt,
            cwd=project_dir,
            effort=active_effort,
            model=active_model,
            agent_id=role.value,
            agent_name=role_info.name,
        ):
            if event.get("step") == "result":
                speech = event.get("content", "")
            elif event.get("step") == "stdout" and not speech:
                speech += event.get("content", "")

            yield f"data: {json.dumps(event)}\n\n"

        meeting_notes.append(f"{role_info.name} ({role_info.title}):\n{speech}\n")
        yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': role.value, 'agent_name': role_info.name})}\n\n"


async def run_single(
    run_id: str, request: RunRequest, project_name: str, project_dir: str
) -> AsyncGenerator[str, None]:
    """Direct single specialist execution"""
    target_role = request.target_role or AgentRole.FRONTEND
    role_info = ROLES_METADATA.get(target_role) or ROLES_METADATA[AgentRole.FRONTEND]
    sys_prompt = get_role_system_prompt(target_role, project_name, project_dir)
    active_model = request.model or getattr(role_info, "model", "default")
    active_effort = request.effort or getattr(role_info, "effort", "medium")

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': f'Direct Specialist Task: {role_info.name}', 'agent_id': target_role.value, 'agent_name': role_info.name, 'role_title': role_info.title, 'avatar': role_info.avatar, 'color': role_info.color, 'model': active_model, 'effort': active_effort})}\n\n"

    turn_prompt = (
        f"=== SYSTEM ROLE INSTRUCTIONS ===\n{sys_prompt}\n\n"
        f"=== USER TASK ===\n{request.prompt}\n"
    )

    async for event in execute_agy_turn(
        run_id=run_id,
        prompt=turn_prompt,
        cwd=project_dir,
        effort=active_effort,
        model=active_model,
        agent_id=target_role.value,
        agent_name=role_info.name,
    ):
        yield f"data: {json.dumps(event)}\n\n"

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': target_role.value, 'agent_name': role_info.name})}\n\n"


async def run_maintenance(
    run_id: str, request: RunRequest, project_name: str, project_dir: str
) -> AsyncGenerator[str, None]:
    """
    Post-Project Maintenance & Support Lifecycle:
    Phase 1: Lucas Miller (Maintenance Lead) triages the change request, inspects project files,
             determines root causes, applies initial hotfixes if appropriate, and issues
             cross-team dispatch directives.
    Phase 2..N: Dispatches to relevant engineering roles according to their duties
             (Backend / Frontend / Database).
    Final Phase: Elena Rostova (QA) verifies the modifications and runs regression tests.
    """
    lucas_info = ROLES_METADATA[AgentRole.MAINTENANCE]
    sys_prompt = get_role_system_prompt(AgentRole.MAINTENANCE, project_name, project_dir)
    lucas_model = request.model or getattr(lucas_info, "model", "default")
    lucas_effort = request.effort or getattr(lucas_info, "effort", "high")

    # 1. Maintenance Triage & Dispatch Plan Phase
    yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': 'Phase 1: Maintenance Triage & Dispatch Planning', 'agent_id': AgentRole.MAINTENANCE.value, 'agent_name': lucas_info.name, 'role_title': lucas_info.title, 'avatar': lucas_info.avatar, 'color': lucas_info.color, 'model': lucas_model, 'effort': lucas_effort})}\n\n"

    turn_prompt = (
        f"=== SYSTEM ROLE INSTRUCTIONS ===\n{sys_prompt}\n\n"
        f"=== CLIENT CHANGE REQUEST / MAINTENANCE TICKET ===\n{request.prompt}\n\n"
        f"IMPORTANT ACTION REQUIRED:\n"
        f"1. Inspect files in {project_dir} to understand the existing codebase.\n"
        f"2. Formulate a structured Maintenance & Dispatch Ticket (MDT).\n"
        f"3. You may apply immediate hotfixes/updates to code files directly using your file tools if straightforward, or specify clear marching orders for Backend (Sean), Frontend (David), or Database (Vikram)."
    )

    lucas_output = ""
    async for event in execute_agy_turn(
        run_id=run_id,
        prompt=turn_prompt,
        cwd=project_dir,
        effort=lucas_effort,
        model=lucas_model,
        agent_id=AgentRole.MAINTENANCE.value,
        agent_name=lucas_info.name,
    ):
        if event.get("step") == "result":
            lucas_output = event.get("content", "")
        elif event.get("step") == "stdout" and not lucas_output:
            lucas_output += event.get("content", "")
        yield f"data: {json.dumps(event)}\n\n"

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': AgentRole.MAINTENANCE.value, 'agent_name': lucas_info.name})}\n\n"

    # Determine coordinated specialists based on prompt, ticket, or target_role
    combined_text = (request.prompt + " " + lucas_output).lower()
    dispatched_roles: List[AgentRole] = []

    if request.target_role and request.target_role != AgentRole.MAINTENANCE:
        dispatched_roles.append(request.target_role)
    else:
        # Check DB
        if any(k in combined_text for k in ["database", "schema", "sqlite", "table", "migration", "sql", "ฐานข้อมูล"]):
            dispatched_roles.append(AgentRole.DATABASE)
        # Check Backend
        if any(k in combined_text for k in ["backend", "api", "endpoint", "server", "controller", "route", "express", "fastapi", "logic", "แบคเอนด์", "เซิร์ฟเวอร์"]):
            dispatched_roles.append(AgentRole.BACKEND)
        # Check Frontend
        if any(k in combined_text for k in ["frontend", "ui", "ux", "button", "css", "html", "style", "view", "component", "screen", "dark mode", "theme", "หน้าเว็บ", "ปุ่ม", "ฟรอนต์เอนด์", "หน้าจอ"]):
            dispatched_roles.append(AgentRole.FRONTEND)

        # If neither was explicitly matched, default to Frontend/Fullstack implementer so code updates occur
        if not dispatched_roles:
            dispatched_roles.append(AgentRole.FRONTEND)

    # Execute coordinated specialist turns
    for role in dispatched_roles:
        role_info = ROLES_METADATA.get(role)
        if not role_info:
            continue

        role_sys_prompt = get_role_system_prompt(role, project_name, project_dir)
        phase_title = f"Phase: Coordinated Modification by {role_info.name} ({role_info.title})"
        spec_model = request.model or getattr(role_info, "model", "default")
        spec_effort = request.effort or getattr(role_info, "effort", "medium")

        yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': phase_title, 'agent_id': role.value, 'agent_name': role_info.name, 'role_title': role_info.title, 'avatar': role_info.avatar, 'color': role_info.color, 'model': spec_model, 'effort': spec_effort})}\n\n"

        spec_prompt = (
            f"=== SYSTEM ROLE INSTRUCTIONS ===\n{role_sys_prompt}\n\n"
            f"=== MAINTENANCE DISPATCH DIRECTIVES FROM LUCAS MILLER ===\n{lucas_output}\n\n"
            f"=== ORIGINAL CLIENT REQUEST ===\n{request.prompt}\n\n"
            f"IMPORTANT ACTION REQUIRED:\n"
            f"Lucas Miller (Maintenance Lead) has assigned this modification to you based on your role duties. "
            f"Inspect the relevant code in {project_dir} and make the necessary code updates/file edits directly into the workspace files using your file writing tools."
        )

        async for event in execute_agy_turn(
            run_id=run_id,
            prompt=spec_prompt,
            cwd=project_dir,
            effort=spec_effort,
            model=spec_model,
            agent_id=role.value,
            agent_name=role_info.name,
        ):
            yield f"data: {json.dumps(event)}\n\n"

        yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': role.value, 'agent_name': role_info.name})}\n\n"

    # Final QA Verification Phase
    qa_info = ROLES_METADATA[AgentRole.QA]
    qa_sys_prompt = get_role_system_prompt(AgentRole.QA, project_name, project_dir)
    qa_phase = "Final Phase: QA Regression Verification & Maintenance Sign-Off"
    qa_model = request.model or getattr(qa_info, "model", "default")
    qa_effort = request.effort or getattr(qa_info, "effort", "medium")

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'phase_change', 'phase': qa_phase, 'agent_id': AgentRole.QA.value, 'agent_name': qa_info.name, 'role_title': qa_info.title, 'avatar': qa_info.avatar, 'color': qa_info.color, 'model': qa_model, 'effort': qa_effort})}\n\n"

    qa_prompt = (
        f"=== SYSTEM ROLE INSTRUCTIONS ===\n{qa_sys_prompt}\n\n"
        f"=== MAINTENANCE TICKET & DISPATCH CONTEXT ===\n{lucas_output}\n\n"
        f"=== CLIENT REQUEST ===\n{request.prompt}\n\n"
        f"IMPORTANT ACTION REQUIRED:\n"
        f"Verify all modified files in {project_dir}. "
        f"Confirm that the requested modifications are working, syntax is clean, no regressions occurred, and provide instructions on how to test the updated project."
    )

    async for event in execute_agy_turn(
        run_id=run_id,
        prompt=qa_prompt,
        cwd=project_dir,
        effort=qa_effort,
        model=qa_model,
        agent_id=AgentRole.QA.value,
        agent_name=qa_info.name,
    ):
        yield f"data: {json.dumps(event)}\n\n"

    yield f"data: {json.dumps({'run_id': run_id, 'step': 'agent_done', 'agent_id': AgentRole.QA.value, 'agent_name': qa_info.name})}\n\n"
