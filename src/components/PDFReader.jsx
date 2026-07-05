import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker - use jsdelivr CDN which is more reliable
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFReader({ resourceId, onClose }) {
  const [resource, setResource] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  useEffect(() => {
    if (resource && resource.current_page) {
      setPageNumber(resource.current_page);
    }
    if (resource) {
      setNotesContent(resource.notes || '');
    }
  }, [resource]);

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResource(data.resource);
        setPageNumber(data.resource.current_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    
    // Update total pages if different
    if (resource && resource.total_pages !== numPages) {
      updateProgress(pageNumber, numPages);
    }
  };

  const updateProgress = async (currentPage, totalPages) => {
    try {
      await fetch(`/api/resources/${resourceId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPage,
          totalPages: totalPages || numPages,
        }),
      });

      // Update local state
      if (resource) {
        const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
        setResource({
          ...resource,
          current_page: currentPage,
          total_pages: totalPages || numPages,
          progress,
        });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const goToPrevPage = () => {
    const newPage = Math.max(1, pageNumber - 1);
    setPageNumber(newPage);
    updateProgress(newPage, numPages);
  };

  const goToNextPage = () => {
    const newPage = Math.min(numPages, pageNumber + 1);
    setPageNumber(newPage);
    updateProgress(newPage, numPages);
  };

  const handlePageChange = (e) => {
    const newPage = parseInt(e.target.value);
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage);
      updateProgress(newPage, numPages);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: notesContent }),
      });

      if (response.ok) {
        setEditingNotes(false);
        await fetchResource();
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const pageInput = e.target.querySelector('input[type="number"]');
    if (pageInput) {
      const targetPage = parseInt(pageInput.value);
      if (targetPage >= 1 && targetPage <= numPages) {
        setPageNumber(targetPage);
        updateProgress(targetPage, numPages);
        pageInput.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Loading resource...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-[var(--bg-card)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Resource not found</p>
      </div>
    );
  }

  const pdfUrl = `/api/resources/${resourceId}/file`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--bg-card)]'} transition-colors`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-[var(--accent)] border-ofa-charcoal' : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                ← Back
              </button>
              <div>
                <h1 className={`font-display text-lg ${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {resource.title}
                </h1>
                {resource.author && (
                  <p className={`text-sm ${darkMode ? 'text-[var(--text-secondary)]' : 'text-[var(--text-secondary)]'}`}>
                    {resource.author}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Progress */}
              <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {Math.round(resource.progress || 0)}%
                </span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
                title="Toggle fullscreen"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer with Sidebar */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Metadata Sidebar */}
        {showSidebar && (
          <div className={`w-80 border-r ${darkMode ? 'bg-[var(--accent)] border-ofa-charcoal' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'} p-6 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-display text-lg ${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>Metadata</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className={`p-1 rounded ${darkMode ? 'hover:bg-[var(--accent-hover)]' : 'hover:bg-[var(--border-subtle)]'}`}
                title="Hide sidebar"
              >
                <svg className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-[var(--text-secondary)]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Title</label>
                <p className={`${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>{resource.title}</p>
              </div>

              {resource.author && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Author</label>
                  <p className={`${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>{resource.author}</p>
                </div>
              )}

              {resource.category && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Category</label>
                  <p className={`${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>{resource.category}</p>
                </div>
              )}

              {resource.folder && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Folder</label>
                  <p className={`${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>{resource.folder}</p>
                </div>
              )}

              <div>
                <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Progress</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>{Math.round(resource.progress || 0)}%</span>
                    <span className={`text-xs ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
                      Page {resource.current_page || 1} of {resource.total_pages || numPages || '?'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{ width: `${resource.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-medium uppercase block ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>Notes</label>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className={`text-xs ${darkMode ? 'text-[var(--text-muted)] hover:text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesContent}
                      onChange={(e) => setNotesContent(e.target.value)}
                      rows={6}
                      className={`w-full px-3 py-2 rounded-lg border resize-none focus:outline-none ${
                        darkMode
                          ? 'bg-[var(--text-primary)] border-[var(--border-mid)] text-white focus:border-[var(--border-mid)]'
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent)]'
                      }`}
                      placeholder="Add your notes here..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="px-3 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50"
                      >
                        {savingNotes ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setNotesContent(resource.notes || '');
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg ${
                          darkMode
                            ? 'bg-[var(--text-secondary)] text-white hover:bg-[var(--accent-hover)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'} whitespace-pre-wrap`}>
                    {resource.notes || 'No notes yet. Click Edit to add notes.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Toggle Button */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className={`fixed left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
              darkMode
                ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            } shadow-lg border ${darkMode ? 'border-[var(--border-mid)]' : 'border-[var(--border-subtle)]'}`}
            title="Show metadata"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        )}

        {/* PDF Viewer */}
        <div className={`flex-1 flex items-center justify-center p-4 ${showSidebar ? '' : 'mx-auto max-w-6xl'}`}>
          <div className="w-full max-w-4xl">
          {pdfLoading && (
            <div className="text-center py-12">
              <p className={darkMode ? 'text-white' : 'text-[var(--text-secondary)]'}>Loading PDF...</p>
            </div>
          )}

          <div className={`${darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--bg-card)]'} rounded-xl p-4 shadow-lg`}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="text-center py-12">
                  <p className={darkMode ? 'text-white' : 'text-[var(--text-secondary)]'}>Loading PDF...</p>
                </div>
              }
              error={
                <div className="text-center py-12">
                  <p className="text-[var(--text-primary)]">Failed to load PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="flex justify-center"
              />
            </Document>
          </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-[var(--accent)] border-ofa-charcoal' : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'} border-t`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                ← Prev
              </button>
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={handlePageChange}
                className={`w-20 px-3 py-2 rounded-xl text-center border ${
                  darkMode
                    ? 'bg-[var(--accent)] border-ofa-charcoal text-white'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                }`}
              />
              <span className={`px-2 ${darkMode ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                of {numPages || '?'}
              </span>
              <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  placeholder="Jump to..."
                  className={`w-24 px-3 py-2 rounded-xl text-center border text-sm ${
                    darkMode
                      ? 'bg-[var(--accent)] border-ofa-charcoal text-white placeholder-gray-500'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-gray-400'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    darkMode
                      ? 'bg-[var(--accent)] text-white hover:opacity-90'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                >
                  Go
                </button>
              </form>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                Next →
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
                title="Zoom out"
              >
                −
              </button>
              <span className={`px-3 ${darkMode ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-[var(--accent)] text-white hover:opacity-90'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
                title="Reset zoom"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{ width: `${resource.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

