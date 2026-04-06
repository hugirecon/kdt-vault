'use client';

import { FileItem } from '@/lib/types';
import { cn, formatFileSize, formatDate, classificationColor, fileTypeIcon } from '@/lib/utils';
import { Lock, ShieldCheck, AlertTriangle, Star, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface FileGridProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  selectedFile?: FileItem | null;
}

export default function FileGrid({ files, onFileClick, selectedFile }: FileGridProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {files.map((file, i) => (
          <div
            key={file.id}
            onClick={() => onFileClick(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            className={cn(
              'group relative rounded-2xl border p-4 cursor-pointer transition-all duration-300',
              'animate-fade-in',
              selectedFile?.id === file.id
                ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-lg hover:shadow-blue-500/5'
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {/* Top row: icon + classification */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{fileTypeIcon(file.type).icon}</div>
              <div className="flex items-center gap-1.5">
                {file.dlpFlag && (
                  <AlertTriangle size={13} className="text-amber-400" />
                )}
                {file.encrypted && (
                  <Lock size={12} className="text-emerald-400/60" />
                )}
                {file.signed && (
                  <ShieldCheck size={12} className="text-blue-400/60" />
                )}
                {file.starred && (
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                )}
              </div>
            </div>

            {/* File name */}
            <div className="text-sm font-medium text-white/85 truncate mb-2 group-hover:text-white/95 transition-colors">
              {file.name}
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between">
              <span className={cn('badge-classified border text-[10px]', classificationColor(file.classification))}>
                {file.classification}
              </span>
              <span className="text-[11px] text-white/30">
                {file.type === 'folder' ? formatDate(file.modified) : formatFileSize(file.size)}
              </span>
            </div>

            {/* Hover details */}
            <div className="mt-2 pt-2 border-t border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/30">{file.owner}</span>
                <span className="text-white/30">{formatDate(file.modified)}</span>
              </div>
              {file.versions > 1 && (
                <div className="text-[10px] text-white/25 mt-1">v{file.versions} • {file.tags.slice(0, 2).join(', ')}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed glass-card p-1.5 shadow-2xl shadow-black/50 z-50 animate-scale-in min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {[
              { label: 'Open', icon: '📂' },
              { label: 'Share', icon: '🔗' },
              { label: 'Download', icon: '⬇️' },
              { label: 'Move to', icon: '📦' },
              { label: 'Copy to', icon: '📋' },
              null,
              { label: 'Classify', icon: '🏷️' },
              { label: 'Version History', icon: '🕐' },
              { label: 'Request Signature', icon: '✍️' },
              null,
              { label: 'Move to Trash', icon: '🗑️', danger: true },
            ].map((item, i) =>
              item === null ? (
                <div key={i} className="my-1 border-t border-white/[0.06]" />
              ) : (
                <button
                  key={i}
                  onClick={() => setContextMenu(null)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150',
                    (item as { danger?: boolean }).danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white/90'
                  )}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </>
  );
}
