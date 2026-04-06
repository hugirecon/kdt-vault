'use client';

import { useState } from 'react';
import { mockAuditLog } from '@/lib/mock-data';
import { cn, classificationColor, actionColor, formatDate } from '@/lib/utils';
import { Search, Filter, Download } from 'lucide-react';

export default function AuditLog() {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = mockAuditLog.filter((entry) => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterClassification !== 'all' && entry.targetClassification !== filterClassification) return false;
    if (search && !entry.target.toLowerCase().includes(search.toLowerCase()) && !entry.user.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actions = ['all', ...new Set(mockAuditLog.map(e => e.action))];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="glass-input py-2 text-sm appearance-none cursor-pointer pr-8"
        >
          {actions.map((a) => (
            <option key={a} value={a} className="bg-gray-900">
              {a === 'all' ? 'All Actions' : a.charAt(0).toUpperCase() + a.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={filterClassification}
          onChange={(e) => setFilterClassification(e.target.value)}
          className="glass-input py-2 text-sm appearance-none cursor-pointer pr-8"
        >
          <option value="all" className="bg-gray-900">All Classifications</option>
          <option value="UNCLASSIFIED" className="bg-gray-900">Unclassified</option>
          <option value="CUI" className="bg-gray-900">CUI</option>
          <option value="CONFIDENTIAL" className="bg-gray-900">Confidential</option>
          <option value="SECRET" className="bg-gray-900">Secret</option>
        </select>
        <button className="glass-button flex items-center gap-2">
          <Download size={13} />
          Export
        </button>
      </div>

      {/* Log entries */}
      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[140px_130px_100px_1fr_120px_100px] gap-3 px-4 py-2.5 border-b border-white/[0.05]">
          {['Timestamp', 'User', 'Action', 'Target', 'Classification', 'IP Address'].map((h) => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.03]">
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              className="grid grid-cols-[140px_130px_100px_1fr_120px_100px] gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors duration-150 animate-fade-in"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <span className="text-[11px] text-white/40 font-mono">
                {new Date(entry.timestamp).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
              <div>
                <div className="text-[11px] text-white/60">{entry.user}</div>
                <div className="text-[10px] text-white/25">{entry.userRole}</div>
              </div>
              <span className={cn('text-[11px] font-medium capitalize', actionColor(entry.action))}>
                {entry.action.replace('_', ' ')}
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-white/60 truncate">{entry.target}</div>
                {entry.details && (
                  <div className="text-[10px] text-white/25 truncate">{entry.details}</div>
                )}
              </div>
              <span className={cn('badge-classified border text-[9px] self-center w-fit', classificationColor(entry.targetClassification))}>
                {entry.targetClassification}
              </span>
              <span className="text-[11px] text-white/30 font-mono">{entry.ip}</span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/25 text-sm">No matching audit entries</div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-[11px] text-white/30 px-1">
        <span>Showing {filtered.length} of {mockAuditLog.length} entries</span>
        <span>Last sync: {formatDate(mockAuditLog[0].timestamp)}</span>
      </div>
    </div>
  );
}
