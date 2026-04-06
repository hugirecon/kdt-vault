'use client';

import { FileItem } from '@/lib/types';
import { cn, formatFileSize, formatDate, classificationColor, fileTypeIcon } from '@/lib/utils';
import { Lock, ShieldCheck, AlertTriangle, Star, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface FileListProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  selectedFile?: FileItem | null;
}

export default function FileList({ files, onFileClick, selectedFile }: FileListProps) {
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'classification'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const sorted = [...files].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
    if (sortBy === 'modified') return (new Date(a.modified).getTime() - new Date(b.modified).getTime()) * dir;
    if (sortBy === 'size') return ((a.size || 0) - (b.size || 0)) * dir;
    return 0;
  });

  const ColHeader = ({ col, label, className }: { col: typeof sortBy; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(col)}
      className={cn('flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors', className)}
    >
      {label}
      {sortBy === col && <ArrowUpDown size={10} />}
    </button>
  );

  return (
    <div className="glass-panel overflow-hidden overflow-x-auto">
      <div className="min-w-[600px]">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_120px_100px_140px_100px] gap-4 px-4 py-2.5 border-b border-white/[0.05]">
        <ColHeader col="name" label="Name" />
        <ColHeader col="classification" label="Classification" />
        <ColHeader col="size" label="Size" />
        <ColHeader col="modified" label="Modified" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/30 text-right">Status</span>
      </div>

      {/* File rows */}
      <div className="divide-y divide-white/[0.03]">
        {sorted.map((file, i) => (
          <div
            key={file.id}
            onClick={() => onFileClick(file)}
            className={cn(
              'grid grid-cols-[1fr_120px_100px_140px_100px] gap-4 px-4 py-3 cursor-pointer transition-all duration-200 animate-fade-in',
              selectedFile?.id === file.id
                ? 'bg-blue-500/10'
                : 'hover:bg-white/[0.03]'
            )}
            style={{ animationDelay: `${i * 20}ms` }}
          >
            {/* Name */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg shrink-0">{fileTypeIcon(file.type).icon}</span>
              <div className="min-w-0">
                <div className="text-sm text-white/85 truncate">{file.name}</div>
                <div className="text-[11px] text-white/30">{file.owner}</div>
              </div>
              {file.starred && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
            </div>

            {/* Classification */}
            <div className="flex items-center">
              <span className={cn('badge-classified border text-[10px]', classificationColor(file.classification))}>
                {file.classification}
              </span>
            </div>

            {/* Size */}
            <div className="flex items-center text-xs text-white/40">
              {formatFileSize(file.size)}
            </div>

            {/* Modified */}
            <div className="flex items-center text-xs text-white/40">
              {formatDate(file.modified)}
            </div>

            {/* Status icons */}
            <div className="flex items-center justify-end gap-2">
              {file.dlpFlag && <AlertTriangle size={13} className="text-amber-400" />}
              {file.encrypted && <Lock size={13} className="text-emerald-400/60" />}
              {file.signed && <ShieldCheck size={13} className="text-blue-400/60" />}
              {file.shared && <span className="text-[10px] text-white/30">Shared</span>}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
