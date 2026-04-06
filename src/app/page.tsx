'use client';

import { useState, useMemo } from 'react';
import { NavSection, ViewMode, FileItem } from '@/lib/types';
import { mockFiles, starredFiles, recentFiles, folders, documents } from '@/lib/mock-data';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FileGrid from '@/components/FileGrid';
import FileList from '@/components/FileList';
import DetailPanel from '@/components/DetailPanel';
import ComplianceDashboard from '@/components/ComplianceDashboard';
import AuditLog from '@/components/AuditLog';
import TeamDrives from '@/components/TeamDrives';
import TrashView from '@/components/TrashView';
import AdminSettings from '@/components/AdminSettings';
import UploadModal from '@/components/UploadModal';
import BulkActions from '@/components/BulkActions';

const sectionTitles: Record<NavSection, string> = {
  'my-files': 'My Files',
  shared: 'Shared with Me',
  'team-drives': 'Team Drives',
  recent: 'Recent',
  starred: 'Starred',
  trash: 'Trash',
  compliance: 'Compliance Dashboard',
  audit: 'Audit Logs',
  admin: 'Admin Settings',
};

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>('my-files');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const getFilesForSection = (): FileItem[] => {
    let files: FileItem[] = [];
    switch (activeSection) {
      case 'my-files': files = mockFiles; break;
      case 'shared': files = mockFiles.filter(f => f.shared); break;
      case 'recent': files = recentFiles; break;
      case 'starred': files = starredFiles; break;
      default: files = mockFiles;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      files = files.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.tags.some(t => t.includes(q)) ||
        f.owner.toLowerCase().includes(q) ||
        f.classification.toLowerCase().includes(q)
      );
    }
    return files;
  };

  const displayFiles = useMemo(() => getFilesForSection(), [activeSection, searchQuery]);

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(selectedFile?.id === file.id ? null : file);
  };

  const isFileView = ['my-files', 'shared', 'recent', 'starred'].includes(activeSection);
  const showViewToggle = isFileView;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeSection={activeSection} onNavigate={(s) => { setActiveSection(s); setSelectedFile(null); }} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUploadClick={() => setShowUpload(true)}
          title={sectionTitles[activeSection]}
        />

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {/* Breadcrumb for file views */}
            {isFileView && (
              <div className="flex items-center gap-2 text-[11px] text-white/30 mb-5">
                <span className="hover:text-white/50 cursor-pointer transition-colors">KDT Vault</span>
                <span>/</span>
                <span className="text-white/50">{sectionTitles[activeSection]}</span>
              </div>
            )}

            {/* Bulk actions */}
            {isFileView && (
              <div className="mb-4">
                <BulkActions count={selectedFiles.length} onClear={() => setSelectedFiles([])} />
              </div>
            )}

            {/* Folder section header for My Files */}
            {activeSection === 'my-files' && !searchQuery && (
              <>
                <div className="mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25">Folders</h2>
                </div>
                {viewMode === 'grid' ? (
                  <FileGrid files={folders} onFileClick={handleFileClick} selectedFile={selectedFile} />
                ) : (
                  <FileList files={folders} onFileClick={handleFileClick} selectedFile={selectedFile} />
                )}
                <div className="mt-8 mb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25">Files</h2>
                </div>
                {viewMode === 'grid' ? (
                  <FileGrid files={documents} onFileClick={handleFileClick} selectedFile={selectedFile} />
                ) : (
                  <FileList files={documents} onFileClick={handleFileClick} selectedFile={selectedFile} />
                )}
              </>
            )}

            {/* Other file views or search results */}
            {isFileView && (activeSection !== 'my-files' || searchQuery) && (
              viewMode === 'grid' ? (
                <FileGrid files={displayFiles} onFileClick={handleFileClick} selectedFile={selectedFile} />
              ) : (
                <FileList files={displayFiles} onFileClick={handleFileClick} selectedFile={selectedFile} />
              )
            )}

            {/* Non-file views */}
            {activeSection === 'team-drives' && <TeamDrives />}
            {activeSection === 'trash' && <TrashView />}
            {activeSection === 'compliance' && <ComplianceDashboard />}
            {activeSection === 'audit' && <AuditLog />}
            {activeSection === 'admin' && <AdminSettings />}
          </main>

          {/* Detail panel */}
          {selectedFile && isFileView && (
            <DetailPanel file={selectedFile} onClose={() => setSelectedFile(null)} />
          )}
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}
