'use client';

import { cn } from '@/lib/utils';
import { Shield, Users, Clock, Lock, Bell, Database, Key, Globe } from 'lucide-react';

const settingSections = [
  {
    title: 'Security Policies',
    icon: <Shield size={18} />,
    settings: [
      { label: 'Require encryption for CONFIDENTIAL+', enabled: true },
      { label: 'Mandatory classification on upload', enabled: true },
      { label: 'Two-factor for SECRET access', enabled: true },
      { label: 'Block external sharing of classified docs', enabled: true },
      { label: 'Auto-scan uploads for sensitive data (DLP)', enabled: true },
    ],
  },
  {
    title: 'Retention Policies',
    icon: <Clock size={18} />,
    settings: [
      { label: 'Default retention: 7 years', enabled: true },
      { label: 'Auto-delete trashed files after 30 days', enabled: true },
      { label: 'Legal hold override enabled', enabled: true },
      { label: 'Notify before auto-deletion (7 days)', enabled: true },
    ],
  },
  {
    title: 'Access Control',
    icon: <Key size={18} />,
    settings: [
      { label: 'Role-based access enforcement', enabled: true },
      { label: 'Quarterly access reviews required', enabled: true },
      { label: 'Auto-revoke on role change', enabled: false },
      { label: 'IP-based access restrictions', enabled: true },
    ],
  },
  {
    title: 'Audit & Monitoring',
    icon: <Database size={18} />,
    settings: [
      { label: 'Full audit trail logging', enabled: true },
      { label: 'Real-time DLP monitoring', enabled: true },
      { label: 'Failed access attempt alerts', enabled: true },
      { label: 'Weekly compliance report generation', enabled: false },
    ],
  },
];

export default function AdminSettings() {
  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      {settingSections.map((section, si) => (
        <div key={section.title} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${si * 80}ms` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-blue-400/70">{section.icon}</div>
            <h3 className="text-sm font-semibold text-white/80">{section.title}</h3>
          </div>
          <div className="space-y-3">
            {section.settings.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between group">
                <span className="text-[13px] text-white/60 group-hover:text-white/75 transition-colors">
                  {setting.label}
                </span>
                <button
                  className={cn(
                    'w-9 h-5 rounded-full transition-all duration-300 relative',
                    setting.enabled
                      ? 'bg-blue-500/40'
                      : 'bg-white/[0.08]'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300',
                      setting.enabled
                        ? 'left-[18px] bg-blue-400'
                        : 'left-0.5 bg-white/30'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
