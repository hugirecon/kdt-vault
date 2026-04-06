'use client';

import { FolderInput, Copy, Trash2, Tag, Share2, X } from 'lucide-react';

interface BulkActionsProps {
  count: number;
  onClear: () => void;
}

export default function BulkActions({ count, onClear }: BulkActionsProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 md:gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-slide-up overflow-x-auto">
      <span className="text-xs text-blue-400 font-medium shrink-0">{count} selected</span>
      <div className="h-4 w-px bg-white/[0.08] shrink-0" />
      {[
        { icon: <FolderInput size={14} />, label: 'Move' },
        { icon: <Copy size={14} />, label: 'Copy' },
        { icon: <Share2 size={14} />, label: 'Share' },
        { icon: <Tag size={14} />, label: 'Classify' },
        { icon: <Trash2 size={14} />, label: 'Delete' },
      ].map((action) => (
        <button
          key={action.label}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all duration-200 shrink-0"
          title={action.label}
        >
          {action.icon}
          <span className="hidden md:inline">{action.label}</span>
        </button>
      ))}
      <div className="flex-1" />
      <button onClick={onClear} className="text-white/30 hover:text-white/50 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
