'use client';

import React, { useState } from 'react';
import { FileNode } from '../types';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  RotateCw,
  X,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface FileExplorerProps {
  files: FileNode[];
  selectedProjectId: string;
  onRefresh: () => void;
  onReadFile: (relPath: string) => Promise<string>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedProjectId,
  onRefresh,
  onReadFile,
}) => {
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleOpenFile = async (relPath: string) => {
    try {
      setIsLoadingFile(true);
      const content = await onReadFile(relPath);
      setSelectedFile({ path: relPath, content });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
      case 'py':
      case 'html':
      case 'css':
        return <FileCode className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-indigo-600 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return (
      <div className="space-y-0.5">
        {nodes.map((node) => {
          if (node.type === 'directory') {
            const isExpanded = expandedDirs[node.rel_path] ?? true;
            return (
              <div key={node.rel_path}>
                <button
                  type="button"
                  onClick={() => toggleDir(node.rel_path)}
                  style={{ paddingLeft: `${depth * 12 + 8}px` }}
                  className="w-full flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 text-slate-700 text-xs text-left transition-colors font-medium"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="truncate">{node.name}</span>
                </button>

                {isExpanded && node.children && (
                  <div>{renderTree(node.children, depth + 1)}</div>
                )}
              </div>
            );
          }

          // File Item
          return (
            <button
              key={node.rel_path}
              type="button"
              onClick={() => handleOpenFile(node.rel_path)}
              style={{ paddingLeft: `${depth * 12 + 20}px` }}
              className={`w-full flex items-center justify-between py-1 px-2 rounded-md text-xs text-left transition-colors font-medium ${
                selectedFile?.path === node.rel_path
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {getFileIcon(node.name)}
                <span className="truncate">{node.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-2">
                {node.size > 1024 ? `${(node.size / 1024).toFixed(1)} KB` : `${node.size} B`}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl flex flex-col h-[650px] shadow-sm shadow-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>Project Workspace Files</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              workspaces/{selectedProjectId}
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs transition-colors shadow-2xs"
          title="Refresh file tree"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Body: Tree + Code Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree List */}
        <div className="w-64 border-r border-slate-200 p-2 overflow-y-auto shrink-0 bg-slate-50/40">
          {files.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No files created yet in this workspace. Launch the company to build!
            </div>
          ) : (
            renderTree(files)
          )}
        </div>

        {/* Code Content Preview */}
        <div className="flex-1 flex flex-col bg-slate-50/20 overflow-hidden">
          {selectedFile ? (
            <>
              {/* File Title Bar */}
              <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-800 truncate flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  {selectedFile.path}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Pre/Text */}
              <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-900 whitespace-pre shadow-inner">
                {selectedFile.content}
              </pre>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <FileCode className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Select a file to inspect code</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                As David (Lead Developer) creates files in real time, click to review the generated implementation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
