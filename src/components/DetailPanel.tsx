'use client';

import { FileItem } from '@/lib/types';
import { cn, formatFileSize, formatDate, classificationColor, fileTypeIcon } from '@/lib/utils';
import {
  X, Lock, ShieldCheck, AlertTriangle, Star, Clock, Users, Tag, History,
  FileCheck, Shield, Download, Share2, Pencil, Trash2
} from 'lucide-react';

interface DetailPanelProps {
  file: FileItem;
  onClose: () => void;
}

export default function DetailPanel({ file, onClose }: DetailPanelProps) {
  return (
    <>
    {/* Mobile overlay backdrop */}
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
    <div className={cn(
      'border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-y-auto animate-slide-in-right',
      // Mobile: full-screen overlay
      'fixed inset-0 z-50 w-full md:relative md:inset-auto md:z-auto md:w-80'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{fileTypeIcon(file.type).icon}</div>
          <button
            onClick={onClose}
            className="p-2 md:p-1 rounded-lg text-white/50 md:text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <X size={20} className="md:hidden" />
            <X size={16} className="hidden md:block" />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-white/90 leading-snug mb-2">{file.name}</h3>
        <div className="flex items-center gap-2">
          <span className={cn('badge-classified border', classificationColor(file.classification))}>
            {file.classification}
          </span>
          {file.approvalStatus && (
            <span className={cn(
              'badge-classified border',
              file.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              file.approvalStatus === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-red-500/20 text-red-400 border-red-500/30'
            )}>
              {file.approvalStatus}
            </span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Download size={15} />, label: 'Download' },
            { icon: <Share2 size={15} />, label: 'Share' },
            { icon: <Pencil size={15} />, label: 'Edit' },
            { icon: <Trash2 size={15} />, label: 'Delete' },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200"
            >
              {action.icon}
              <span className="text-[10px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        {/* Security status */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Security Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Lock size={13} className={file.encrypted ? 'text-emerald-400' : 'text-white/20'} />
                Encryption
              </div>
              <span className={cn('text-[11px] font-medium', file.encrypted ? 'text-emerald-400' : 'text-white/30')}>
                {file.encrypted ? 'AES-256' : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <ShieldCheck size={13} className={file.signed ? 'text-blue-400' : 'text-white/20'} />
                Digital Signature
              </div>
              <span className={cn('text-[11px] font-medium', file.signed ? 'text-blue-400' : 'text-white/30')}>
                {file.signed ? 'Verified' : 'Unsigned'}
              </span>
            </div>
            {file.dlpFlag && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                <span className="text-[11px] text-amber-400">DLP: Sensitive data pattern detected</span>
              </div>
            )}
          </div>
        </div>

        {/* File info */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">File Information</h4>
          <div className="space-y-2">
            {[
              { label: 'Size', value: formatFileSize(file.size) },
              { label: 'Owner', value: file.owner },
              { label: 'Created', value: formatDate(file.created) },
              { label: 'Modified', value: formatDate(file.modified) },
              { label: 'Versions', value: file.versions.toString() },
              ...(file.retentionDays ? [{ label: 'Retention', value: `${file.retentionDays} days` }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[11px] text-white/35">{row.label}</span>
                <span className="text-[11px] text-white/60">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {file.tags.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {file.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Version history */}
        {file.versions > 1 && (
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Version History</h4>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(file.versions, 4) }, (_, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <div className={cn(
                    'w-1 h-1 rounded-full',
                    i === 0 ? 'bg-blue-400' : 'bg-white/20'
                  )} />
                  <span className="text-white/50">v{file.versions - i}</span>
                  <span className="text-white/25">•</span>
                  <span className="text-white/35">
                    {i === 0 ? 'Current' : `${i * 2 + 1}d ago`}
                  </span>
                </div>
              ))}
              {file.versions > 4 && (
                <button className="text-[11px] text-blue-400/60 hover:text-blue-400 transition-colors">
                  View all {file.versions} versions →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Access control */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Access Control</h4>
          <div className="space-y-2">
            {[
              { role: 'CEO', access: 'Full Access', color: 'text-emerald-400' },
              { role: 'COO', access: file.classification === 'SECRET' ? 'View Only' : 'Edit', color: 'text-blue-400' },
              { role: 'Operations', access: file.shared ? 'View Only' : 'No Access', color: file.shared ? 'text-amber-400' : 'text-red-400' },
            ].map((perm) => (
              <div key={perm.role} className="flex items-center justify-between">
                <span className="text-[11px] text-white/50">{perm.role}</span>
                <span className={cn('text-[11px] font-medium', perm.color)}>{perm.access}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
