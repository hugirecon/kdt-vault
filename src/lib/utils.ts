import { ClassificationLevel, FileType } from './types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) return `${Math.floor(diffMs / 60000)} min ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function classificationColor(level: ClassificationLevel): string {
  switch (level) {
    case 'UNCLASSIFIED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'CUI': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'CONFIDENTIAL': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'SECRET': return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

export function classificationDotColor(level: ClassificationLevel): string {
  switch (level) {
    case 'UNCLASSIFIED': return 'bg-emerald-400';
    case 'CUI': return 'bg-blue-400';
    case 'CONFIDENTIAL': return 'bg-amber-400';
    case 'SECRET': return 'bg-red-400';
  }
}

export function fileTypeIcon(type: FileType): { icon: string; color: string } {
  switch (type) {
    case 'folder': return { icon: '📁', color: 'text-blue-400' };
    case 'document': return { icon: '📄', color: 'text-blue-300' };
    case 'spreadsheet': return { icon: '📊', color: 'text-emerald-400' };
    case 'presentation': return { icon: '📰', color: 'text-orange-400' };
    case 'pdf': return { icon: '📕', color: 'text-red-400' };
    case 'image': return { icon: '🖼️', color: 'text-purple-400' };
    case 'video': return { icon: '🎬', color: 'text-pink-400' };
    case 'archive': return { icon: '📦', color: 'text-yellow-400' };
    case 'code': return { icon: '💻', color: 'text-cyan-400' };
  }
}

export function actionColor(action: string): string {
  switch (action) {
    case 'viewed': return 'text-blue-400';
    case 'downloaded': return 'text-cyan-400';
    case 'uploaded': return 'text-emerald-400';
    case 'modified': return 'text-amber-400';
    case 'deleted': return 'text-red-400';
    case 'shared': return 'text-purple-400';
    case 'classified': return 'text-orange-400';
    case 'signed': return 'text-green-400';
    case 'permission_changed': return 'text-yellow-400';
    default: return 'text-white/50';
  }
}
