'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Upload, LayoutGrid, List, Filter, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewMode, ClassificationLevel } from '@/lib/types';
import { mockNotifications, currentUser } from '@/lib/mock-data';
import { classificationColor } from '@/lib/utils';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  title: string;
  onMenuClick?: () => void;
}

export default function Header({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onUploadClick,
  title,
  onMenuClick,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-3 md:px-6 gap-2 md:gap-4">
      {/* Hamburger + Title */}
      <div className="flex items-center gap-2 shrink-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-base md:text-lg font-semibold text-white/90 hidden sm:block">{title}</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search files, folders, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="glass-input w-full pl-10 pr-10 py-2 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* View toggle - hidden on mobile */}
        <div className="hidden md:flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-1.5 rounded-md transition-all duration-200',
              viewMode === 'grid' ? 'bg-white/[0.1] text-white/90' : 'text-white/40 hover:text-white/60'
            )}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-1.5 rounded-md transition-all duration-200',
              viewMode === 'list' ? 'bg-white/[0.1] text-white/90' : 'text-white/40 hover:text-white/60'
            )}
          >
            <List size={15} />
          </button>
        </div>

        {/* Upload */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-2.5 md:px-3.5 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all duration-200"
        >
          <Upload size={14} />
          <span className="hidden md:inline">Upload</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 glass-card p-2 shadow-2xl shadow-black/40 animate-scale-in z-50">
              <div className="px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                Notifications
              </div>
              {mockNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'px-3 py-2.5 rounded-xl transition-colors duration-200 cursor-pointer',
                    n.read ? 'hover:bg-white/[0.03]' : 'bg-white/[0.03] hover:bg-white/[0.05]'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />}
                    <div className={cn(!n.read ? '' : 'ml-3.5')}>
                      <div className="text-xs font-medium text-white/80">{n.title}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">{n.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-1 md:pl-3 pr-1 py-1 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="hidden md:block">
              <div className="text-xs font-medium text-white/80 text-right">{currentUser.name}</div>
              <div className="text-[10px] text-white/40 text-right">{currentUser.role}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {currentUser.avatar}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 w-64 glass-card p-4 shadow-2xl shadow-black/40 animate-scale-in z-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white/90">{currentUser.name}</div>
                  <div className="text-xs text-white/40">{currentUser.email}</div>
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Clearance Level</span>
                  <span className={cn('badge-classified border', classificationColor(currentUser.clearanceLevel))}>
                    {currentUser.clearanceLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
