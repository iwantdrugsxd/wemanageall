import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PDFReader from '../components/PDFReader';

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [selectedCategory]);

  const fetchResources = async () => {
    try {
      const categoryParam = selectedCategory === 'all' ? '' : selectedCategory;
      const response = await fetch(`/api/resources?category=${categoryParam}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/resources/categories', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadFile(file);
      if (!title) {
        setTitle(file.name.replace('.pdf', ''));
      }
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadFile(file);
      if (!title) {
        setTitle(file.name.replace('.pdf', ''));
      }
    } else {
      alert('Please drop a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', title || uploadFile.name);
      formData.append('category', category);
      formData.append('author', author);
      formData.append('priority', priority);
      formData.append('notes', notes);

      const response = await fetch('/api/resources/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setShowAddModal(false);
        resetForm();
        // Refresh the resources list
        await fetchResources();
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload resource');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setUploadFile(null);
    setTitle('');
    setCategory('Uncategorized');
    setAuthor('');
    setPriority('normal');
    setNotes('');
  };

  const handleOpenResource = (resourceId) => {
    navigate(`/library/${resourceId}`);
  };

  const handleDeleteResource = async (resourceId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setResources(prev => prev.filter(r => r.id !== resourceId));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete resource');
    }
  };

  // Group resources by category
  const groupedResources = resources.reduce((acc, resource) => {
    const cat = resource.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(resource);
    return acc;
  }, {});

  const allCategories = ['All Resources', ...categories.map(c => c.category)];

  // If viewing a specific resource, show PDF reader
  if (id) {
    return <PDFReader resourceId={id} onClose={() => navigate('/library')} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-black mb-2">Resource Library</h1>
          <p className="text-gray-600 text-lg">Curated intellectual assets and reading logs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-xl">+</span>
          <span>Add Resource</span>
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-300 pb-4">
        {allCategories.map((cat) => {
          const isActive = (cat === 'All Resources' && selectedCategory === 'all') || 
                          (cat !== 'All Resources' && selectedCategory === cat);
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All Resources' ? 'all' : cat)}
              className={`text-sm font-medium transition-colors pb-2 ${
                isActive
                  ? 'text-black border-b-2 border-ofa-ink'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Resources by Category */}
      {selectedCategory === 'all' ? (
        Object.keys(groupedResources).map((category) => (
          <div key={category} className="mb-12">
            <h2 className="font-display text-3xl text-black mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedResources[category].map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpen={handleOpenResource}
                  onDelete={handleDeleteResource}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="mb-12">
          <h2 className="font-display text-3xl text-black mb-6">{selectedCategory}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onOpen={handleOpenResource}
                onDelete={handleDeleteResource}
              />
            ))}
          </div>
        </div>
      )}

      {resources.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">No resources yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
          >
            Add Your First Resource
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-3xl text-black mb-2">Add New Resource</h2>
                  <p className="text-gray-600 text-sm">Peaceful Professionalism — Organize your digital library</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-black transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center mb-6 transition-colors ${
                  dragActive
                    ? 'border-ofa-calm bg-black/10'
                    : 'border-gray-300 hover:border-ofa-calm'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadFile ? (
                  <div>
                    <div className="text-black text-4xl mb-4">✓</div>
                    <p className="text-black font-medium mb-2">{uploadFile.name}</p>
                    <p className="text-gray-600 text-sm mb-4">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="text-gray-600 hover:text-black text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-black text-4xl mb-4">📄</div>
                    <p className="text-black font-medium mb-2">Upload PDF</p>
                    <p className="text-gray-600 text-sm mb-4">
                      Drag and drop your document here or click to browse files
                    </p>
                    <label className="inline-block px-6 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors cursor-pointer">
                      Select File
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Resource Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quarterly Investment Outlook"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Robert C. Martin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      list="category-list"
                      placeholder="Type or select a category"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    />
                    <datalist id="category-list">
                      <option value="Uncategorized">Uncategorized</option>
                      <option value="Programming">Programming</option>
                      <option value="Design">Design</option>
                      <option value="Growth">Growth</option>
                      <option value="Philosophy">Philosophy</option>
                      {categories
                        .filter(c => !['Uncategorized', 'Programming', 'Design', 'Growth', 'Philosophy'].includes(c.category))
                        .map(c => (
                          <option key={c.category} value={c.category}>{c.category}</option>
                        ))}
                    </datalist>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Type a new category name or select from existing ones</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Priority Level</label>
                  <div className="flex gap-2">
                    {['low', 'normal', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                          priority === p
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Initial Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add key takeaways or reason for saving..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-300">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <span>📁</span>
                  <span>{uploading ? 'Uploading...' : 'Save to Library'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Resource Card Component
function ResourceCard({ resource, onOpen, onDelete }) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onOpen(resource.id)}
    >
      {/* Cover Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-ofa-calm/20 to-ofa-calm/10 flex items-center justify-center">
        <span className="text-6xl">📄</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-black mb-1 line-clamp-2">{resource.title}</h3>
        {resource.author && (
          <p className="text-sm text-gray-600 mb-3">{resource.author}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Progress</span>
            <span className="text-xs font-medium text-black">{Math.round(resource.progress || 0)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${resource.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(resource.id);
            }}
            className="px-4 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <span>▶</span>
            <span>Resume Reading</span>
          </button>
          <button
            onClick={(e) => onDelete(resource.id, e)}
            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-black transition-all"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

