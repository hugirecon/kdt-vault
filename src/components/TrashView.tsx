'use client';

import { cn, classificationColor, formatDate, fileTypeIcon } from '@/lib/utils';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';

const trashedFiles = [
  { id: 't1', name: 'Outdated Policy Draft v1.docx', type: 'document' as const, classification: 'CUI' as const, deletedBy: 'Sarah Chen', deletedAt: '2026-04-05T17:00:00Z', retentionExpiry: '2026-05-05T17:00:00Z', size: 145000 },
  { id: 't2', name: 'Old Vendor Contact List.xlsx', type: 'spreadsheet' as const, classification: 'UNCLASSIFIED' as const, deletedBy: 'Matthew McCalla', deletedAt: '2026-04-03T10:00:00Z', retentionExpiry: '2026-05-03T10:00:00Z', size: 67000 },
  { id: 't3', name: 'Draft Proposal - Cancelled.pdf', type: 'pdf' as const, classification: 'CONFIDENTIAL' as const, deletedBy: 'Michael Schulz', deletedAt: '2026-03-28T14:00:00Z', retentionExpiry: '2026-04-27T14:00:00Z', size: 2300000 },
];

export default function TrashView() {
  return (
    <div className="animate-fade-in">
      {/* Warning banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
        <AlertCircle size={16} className="text-amber-400 shrink-0" />
        <div>
          <div className="text-xs text-amber-400 font-medium">Retention Policy Active</div>
          <div className="text-[11px] text-amber-400/60">Files are permanently deleted 30 days after being trashed. Files with legal hold will be retained regardless.</div>
        </div>
      </div>

      {/* Trash items */}
      <div className="glass-panel overflow-hidden overflow-x-auto">
        <div className="min-w-[700px]">
        <div className="grid grid-cols-[1fr_120px_120px_140px_120px] gap-4 px-4 py-2.5 border-b border-white/[0.05]">
          {['Name', 'Classification', 'Deleted By', 'Deleted', 'Auto-Delete'].map(h => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-white/[0.03]">
          {trashedFiles.map((file, i) => {
            const daysLeft = Math.ceil((new Date(file.retentionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div
                key={file.id}
                className="grid grid-cols-[1fr_120px_120px_140px_120px] gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg opacity-50">{fileTypeIcon(file.type).icon}</span>
                  <span className="text-sm text-white/50 truncate">{file.name}</span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-all">
                    <RotateCcw size={13} />
                  </button>
                </div>
                <span className={cn('badge-classified border text-[10px] self-center w-fit', classificationColor(file.classification))}>
                  {file.classification}
                </span>
                <span className="text-[11px] text-white/40 self-center">{file.deletedBy}</span>
                <span className="text-[11px] text-white/35 self-center">{formatDate(file.deletedAt)}</span>
                <span className={cn(
                  'text-[11px] font-medium self-center',
                  daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-white/35'
                )}>
                  {daysLeft}d remaining
                </span>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Empty state if needed */}
      <div className="mt-4 text-center text-[11px] text-white/20">
        {trashedFiles.length} items in trash • 2.4 MB total
      </div>
    </div>
  );
}
