'use client';

import { useState } from 'react';
import { X, Upload, Shield, Lock, Tag, FolderOpen } from 'lucide-react';
import { cn, classificationColor } from '@/lib/utils';
import { ClassificationLevel } from '@/lib/types';

interface UploadModalProps {
  onClose: () => void;
}

export default function UploadModal({ onClose }: UploadModalProps) {
  const [classification, setClassification] = useState<ClassificationLevel>('CUI');
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Mock: just show file names
    setFiles(['After-Action-Report-2026-04.pdf', 'Site-Photos-Batch3.zip']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="glass-card w-full h-full sm:h-auto sm:max-w-lg p-4 sm:p-6 shadow-2xl shadow-black/40 animate-scale-in overflow-y-auto mx-0 sm:mx-4 rounded-none sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white/90">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => setFiles(['After-Action-Report-2026-04.pdf', 'Site-Photos-Batch3.zip'])}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
            dragOver
              ? 'border-blue-400/50 bg-blue-500/10'
              : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
          )}
        >
          <Upload size={32} className={cn('mx-auto mb-3', dragOver ? 'text-blue-400' : 'text-white/20')} />
          <div className="text-sm text-white/50 mb-1">
            {dragOver ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </div>
          <div className="text-[11px] text-white/25">Max 500MB per file • All uploads are scanned by DLP</div>
        </div>

        {/* Uploaded files */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📄</span>
                  <span className="text-xs text-white/70">{f}</span>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="text-white/25 hover:text-white/50"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Classification picker */}
        <div className="mt-5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30 block mb-2">
            Classification Level
          </label>
          <div className="grid grid-cols-2 sm:flex gap-2">
            {(['UNCLASSIFIED', 'CUI', 'CONFIDENTIAL', 'SECRET'] as ClassificationLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setClassification(level)}
                className={cn(
                  'badge-classified border transition-all duration-200',
                  classificationColor(level),
                  classification === level ? 'ring-1 ring-white/20 scale-105' : 'opacity-50 hover:opacity-80'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] transition-all">
            <input type="checkbox" defaultChecked className="accent-blue-500" />
            <Lock size={13} className="text-emerald-400/60" />
            <span className="text-xs text-white/60">Encrypt (AES-256)</span>
          </label>
          <label className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] cursor-pointer hover:bg-white/[0.04] transition-all">
            <input type="checkbox" className="accent-blue-500" />
            <Shield size={13} className="text-blue-400/60" />
            <span className="text-xs text-white/60">Request Signature</span>
          </label>
        </div>

        {/* Destination */}
        <div className="mt-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/30 block mb-2">
            Destination Folder
          </label>
          <button className="glass-input w-full flex items-center gap-2 text-sm text-white/50">
            <FolderOpen size={14} />
            My Files / Operations
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="glass-button">Cancel</button>
          <button className="px-4 py-2 bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/35 transition-all duration-200">
            Upload {files.length > 0 ? `${files.length} Files` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
