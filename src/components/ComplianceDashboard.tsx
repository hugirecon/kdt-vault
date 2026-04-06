'use client';

import { mockComplianceStats, mockFiles } from '@/lib/mock-data';
import { cn, classificationColor } from '@/lib/utils';
import { ShieldCheck, AlertTriangle, TrendingUp, Lock, FileCheck, Eye } from 'lucide-react';

export default function ComplianceDashboard() {
  const classificationCounts = {
    UNCLASSIFIED: mockFiles.filter(f => f.classification === 'UNCLASSIFIED').length,
    CUI: mockFiles.filter(f => f.classification === 'CUI').length,
    CONFIDENTIAL: mockFiles.filter(f => f.classification === 'CONFIDENTIAL').length,
    SECRET: mockFiles.filter(f => f.classification === 'SECRET').length,
  };
  const total = mockFiles.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <FileCheck size={20} />, label: 'Total Documents', value: '162', sub: '+8 this week', color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
          { icon: <Lock size={20} />, label: 'Encrypted Files', value: '89', sub: '94.7% of required', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
          { icon: <ShieldCheck size={20} />, label: 'Signed Documents', value: '42', sub: '62.7% of required', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
          { icon: <AlertTriangle size={20} />, label: 'DLP Violations', value: '3', sub: 'Month to date', color: 'from-red-500/20 to-red-600/10', iconColor: 'text-red-400' },
        ].map((card) => (
          <div
            key={card.label}
            className={cn(
              'glass-card p-5 bg-gradient-to-br',
              card.color
            )}
          >
            <div className={cn('mb-3', card.iconColor)}>{card.icon}</div>
            <div className="text-2xl font-bold text-white/90 mb-0.5">{card.value}</div>
            <div className="text-xs text-white/50">{card.label}</div>
            <div className="text-[11px] text-white/30 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance metrics */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Policy Compliance</h3>
          <div className="space-y-4">
            {mockComplianceStats.map((stat) => {
              const pct = stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : (stat.value > 0 ? 100 : 0);
              const isViolation = stat.label.includes('Violation');
              return (
                <div key={stat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/80 font-medium">
                        {isViolation ? stat.value : `${stat.value}/${stat.total}`}
                      </span>
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        stat.status === 'good' ? 'bg-emerald-400' :
                        stat.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                      )} />
                    </div>
                  </div>
                  {!isViolation && (
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          stat.status === 'good' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          stat.status === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Classification breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Classification Distribution</h3>
          <div className="space-y-3">
            {(Object.entries(classificationCounts) as [string, number][]).map(([level, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn('badge-classified border', classificationColor(level as any))}>
                      {level}
                    </span>
                    <span className="text-xs text-white/50">{count} files ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        level === 'SECRET' ? 'bg-red-400' :
                        level === 'CONFIDENTIAL' ? 'bg-amber-400' :
                        level === 'CUI' ? 'bg-blue-400' : 'bg-emerald-400'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent compliance actions */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">Recent Actions</h4>
            <div className="space-y-2.5">
              {[
                { text: 'Classification upgraded: Comms Plan', time: '2h ago', type: 'classified' },
                { text: 'DLP scan completed: 3 flags found', time: '4h ago', type: 'dlp' },
                { text: 'Quarterly access review initiated', time: '1d ago', type: 'review' },
                { text: 'Retention policy applied to 12 files', time: '2d ago', type: 'retention' },
              ].map((action, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">{action.text}</span>
                  <span className="text-[10px] text-white/25">{action.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
