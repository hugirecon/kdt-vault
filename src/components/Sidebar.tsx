'use client';

import { NavSection } from '@/lib/types';
import {
  FolderOpen,
  Users,
  HardDrive,
  Clock,
  Star,
  Trash2,
  ShieldCheck,
  FileSearch,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: { id: NavSection; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'my-files', label: 'My Files', icon: <FolderOpen size={18} />, group: 'main' },
  { id: 'shared', label: 'Shared with Me', icon: <Users size={18} />, group: 'main' },
  { id: 'team-drives', label: 'Team Drives', icon: <HardDrive size={18} />, group: 'main' },
  { id: 'recent', label: 'Recent', icon: <Clock size={18} />, group: 'main' },
  { id: 'starred', label: 'Starred', icon: <Star size={18} />, group: 'main' },
  { id: 'trash', label: 'Trash', icon: <Trash2 size={18} />, group: 'main' },
  { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={18} />, group: 'admin' },
  { id: 'audit', label: 'Audit Logs', icon: <FileSearch size={18} />, group: 'admin' },
  { id: 'admin', label: 'Admin Settings', icon: <Settings size={18} />, group: 'admin' },
];

export default function Sidebar({ activeSection, onNavigate, isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const mainItems = navItems.filter(i => i.group === 'main');
  const adminItems = navItems.filter(i => i.group === 'admin');

  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-300',
        // Mobile: fixed overlay sidebar
        'fixed md:relative z-40 md:z-auto',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        collapsed ? 'md:w-16 w-60' : 'w-60'
      )}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
          K
        </div>
        {!collapsed && (
          <div className="animate-fade-in flex-1">
            <div className="text-sm font-semibold text-white/90 leading-tight">KDT Vault</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Knight Division Tactical</div>
          </div>
        )}
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200',
                activeSection === item.id
                  ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="my-4 mx-3 border-t border-white/[0.06]" />

        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Administration</span>
          </div>
        )}
        <div className="space-y-0.5">
          {adminItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200',
                activeSection === item.id
                  ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/10'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Storage indicator */}
      {!collapsed && (
        <div className="p-4 border-t border-white/[0.06] animate-fade-in">
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-white/40">Storage</span>
            <span className="text-white/60">18.4 GB / 50 GB</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: '36.8%' }}
            />
          </div>
        </div>
      )}

      {/* Collapse toggle - hidden on mobile */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.1] items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-all duration-200 z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
