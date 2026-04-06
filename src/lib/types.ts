export type ClassificationLevel = 'UNCLASSIFIED' | 'CUI' | 'CONFIDENTIAL' | 'SECRET';

export type FileType = 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'video' | 'archive' | 'code';

export type ViewMode = 'grid' | 'list';

export type NavSection = 'my-files' | 'shared' | 'team-drives' | 'recent' | 'starred' | 'trash' | 'compliance' | 'audit' | 'admin';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  classification: ClassificationLevel;
  size?: number;
  modified: string;
  created: string;
  owner: string;
  ownerAvatar?: string;
  shared: boolean;
  starred: boolean;
  encrypted: boolean;
  signed: boolean;
  retentionDays?: number;
  tags: string[];
  parentId?: string;
  versions: number;
  dlpFlag?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  children?: FileItem[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: 'viewed' | 'downloaded' | 'uploaded' | 'modified' | 'deleted' | 'shared' | 'classified' | 'signed' | 'permission_changed';
  target: string;
  targetClassification: ClassificationLevel;
  ip: string;
  details?: string;
}

export interface ComplianceStat {
  label: string;
  value: number;
  total: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TeamDrive {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  fileCount: number;
  classification: ClassificationLevel;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'share' | 'compliance' | 'approval' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
  clearanceLevel: ClassificationLevel;
}
