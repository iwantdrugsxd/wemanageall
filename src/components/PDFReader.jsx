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

  useEffect(() => {
    fetchResource();
  }, [resourceId]);

  useEffect(() => {
    if (resource && resource.current_page) {
      setPageNumber(resource.current_page);
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

      {/* PDF Viewer */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
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

