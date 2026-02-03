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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading resource...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Resource not found</p>
      </div>
    );
  }

  const pdfUrl = `/api/resources/${resourceId}/file`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'} transition-colors`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-black border-ofa-charcoal' : 'bg-white border-gray-300'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                ← Back
              </button>
              <div>
                <h1 className={`font-display text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                  {resource.title}
                </h1>
                {resource.author && (
                  <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                    {resource.author}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Progress */}
              <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                  {Math.round(resource.progress || 0)}%
                </span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
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
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
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
          <div className={`w-80 border-r ${darkMode ? 'bg-black border-ofa-charcoal' : 'bg-gray-50 border-gray-300'} p-6 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-display text-lg ${darkMode ? 'text-white' : 'text-black'}`}>Metadata</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                title="Hide sidebar"
              >
                <svg className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title</label>
                <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{resource.title}</p>
              </div>

              {resource.author && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Author</label>
                  <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{resource.author}</p>
                </div>
              )}

              {resource.category && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                  <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{resource.category}</p>
                </div>
              )}

              {resource.folder && (
                <div>
                  <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Folder</label>
                  <p className={`${darkMode ? 'text-white' : 'text-black'}`}>{resource.folder}</p>
                </div>
              )}

              <div>
                <label className={`text-xs font-medium uppercase mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{Math.round(resource.progress || 0)}%</span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Page {resource.current_page || 1} of {resource.total_pages || numPages || '?'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all"
                      style={{ width: `${resource.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs font-medium uppercase block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notes</label>
                  {!editingNotes && (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className={`text-xs ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
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
                          ? 'bg-gray-900 border-gray-700 text-white focus:border-gray-600'
                          : 'bg-white border-gray-300 text-black focus:border-black'
                      }`}
                      placeholder="Add your notes here..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
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
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
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
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white text-black hover:bg-gray-100'
            } shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
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
              <p className={darkMode ? 'text-white' : 'text-gray-600'}>Loading PDF...</p>
            </div>
          )}

          <div className={`${darkMode ? 'bg-black' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="text-center py-12">
                  <p className={darkMode ? 'text-white' : 'text-gray-600'}>Loading PDF...</p>
                </div>
              }
              error={
                <div className="text-center py-12">
                  <p className="text-black">Failed to load PDF</p>
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

      {/* Controls */}
      <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black border-ofa-charcoal' : 'bg-white border-gray-300'} border-t`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                  darkMode
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
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
                    ? 'bg-black border-ofa-charcoal text-white'
                    : 'bg-white border-gray-300 text-black'
                }`}
              />
              <span className={`px-2 ${darkMode ? 'text-white' : 'text-gray-600'}`}>
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
                      ? 'bg-black border-ofa-charcoal text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    darkMode
                      ? 'bg-black text-white hover:bg-black/80'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
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
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
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
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                title="Zoom out"
              >
                −
              </button>
              <span className={`px-3 ${darkMode ? 'text-white' : 'text-gray-600'}`}>
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={resetZoom}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  darkMode
                    ? 'bg-black text-white hover:bg-black/80'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
                title="Reset zoom"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${resource.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

