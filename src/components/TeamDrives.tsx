'use client';

import { mockTeamDrives } from '@/lib/mock-data';
import { cn, classificationColor } from '@/lib/utils';
import { Users, FileText, Lock } from 'lucide-react';

export default function TeamDrives() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
      {mockTeamDrives.map((drive, i) => (
        <div
          key={drive.id}
          className="glass-card-hover p-5 cursor-pointer group animate-slide-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">{drive.icon}</div>
            <span className={cn('badge-classified border', classificationColor(drive.classification))}>
              {drive.classification}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white/85 mb-1 group-hover:text-white/95 transition-colors">
            {drive.name}
          </h3>
          <p className="text-[11px] text-white/35 mb-4 leading-relaxed">
            {drive.description}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-white/30">
            <div className="flex items-center gap-1.5">
              <Users size={12} />
              {drive.memberCount} members
            </div>
            <div className="flex items-center gap-1.5">
              <FileText size={12} />
              {drive.fileCount} files
            </div>
          </div>
        </div>
      ))}

      {/* Create new */}
      <div
        className="glass-card border-dashed border-white/[0.08] p-5 cursor-pointer flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/40 hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300 min-h-[180px]"
      >
        <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center text-lg">+</div>
        <span className="text-xs">Create Team Drive</span>
      </div>
    </div>
  );
}
