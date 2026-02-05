import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PDFReader from '../components/PDFReader';

export default function Library({ embedded = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isResourcesRoute = location.pathname.startsWith('/resources');
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'Uncategorized',
    folder: '',
    notes: '',
    author: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [error, setError] = useState(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [folder, setFolder] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [selectedCategory, selectedFolder, selectedPriority, searchQuery]);

  const fetchResources = async () => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedFolder !== 'all' && selectedFolder) params.append('folder', selectedFolder);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/resources?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        let filtered = data.resources || [];
        
        // Client-side priority filter
        if (selectedPriority !== 'all') {
          filtered = filtered.filter(r => r.priority === selectedPriority);
        }
        
        setResources(filtered);
      } else {
        const errorText = await response.text();
        setError(`Failed to load resources: ${response.status} ${response.statusText}`);
        console.error('Failed to fetch resources:', response.status, errorText);
      }
    } catch (error) {
      setError(`Network error: ${error.message}. Please check your connection and try again.`);
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
      } else {
        // Categories failure is non-critical, log but don't block UI
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      // Categories failure is non-critical, log but don't block UI
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
      setUploadError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', title || uploadFile.name);
      formData.append('category', category);
      formData.append('folder', folder || null);
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
        setUploadError(null);
        // Refresh the resources list
        await fetchResources();
        await fetchCategories();
      } else {
        const error = await response.json();
        setUploadError(error.error || 'Failed to upload resource');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Network error. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setUploadFile(null);
    setTitle('');
    setCategory('Uncategorized');
    setFolder('');
    setAuthor('');
    setPriority('normal');
    setNotes('');
    setUploadError(null);
    setDragActive(false);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setEditForm({
      title: resource.title || '',
      category: resource.category || 'Uncategorized',
      folder: resource.folder || '',
      notes: resource.notes || '',
      author: resource.author || '',
      priority: resource.priority || 'normal'
    });
  };

  const handleUpdateResource = async () => {
    if (!editingResource) return;

    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingResource(null);
        setEditForm({
          title: '',
          category: 'Uncategorized',
          folder: '',
          notes: '',
          author: '',
          priority: 'normal'
        });
        await fetchResources();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Update resource error:', error);
      alert('Failed to update resource');
    }
  };

  // Get unique folders from resources
  const folders = Array.from(new Set(resources.map(r => r.folder).filter(Boolean))).sort();
  
  // Get continue reading resources (sorted by last_opened_at, with progress > 0)
  const continueReading = resources
    .filter(r => r.last_opened_at && r.progress > 0 && r.progress < 100)
    .sort((a, b) => new Date(b.last_opened_at) - new Date(a.last_opened_at))
    .slice(0, 6);

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
    <div className={embedded ? "" : "max-w-7xl mx-auto px-6 lg:px-8 py-12"}>
      {/* Header - only show if not embedded */}
      {!embedded && (
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
      )}

      {/* Search and Filters - only show if no error */}
      {!error && (
        <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or notes..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
          />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
          >
            <option value="all">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      )}

      {/* Category Navigation - only show if no error */}
      {!error && (
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
      )}

      {/* Continue Reading Section - only show if no error */}
      {!error && continueReading.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-black mb-4">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReading.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onOpen={handleOpenResource}
                onDelete={handleDeleteResource}
                onEdit={handleEditResource}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resources by Category - only show if no error */}
      {!error && (
      selectedCategory === 'all' ? (
        Object.keys(groupedResources).map((category) => (
          <div key={category} className="mb-12">
            <h2 className="font-display text-3xl text-black mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedResources[category].filter(r => !continueReading.find(cr => cr.id === r.id)).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpen={handleOpenResource}
                  onDelete={handleDeleteResource}
                  onEdit={handleEditResource}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="mb-12">
          <h2 className="font-display text-3xl text-black mb-6">{selectedCategory}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.filter(r => !continueReading.find(cr => cr.id === r.id)).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpen={handleOpenResource}
                  onDelete={handleDeleteResource}
                  onEdit={handleEditResource}
                />
              ))}
          </div>
        </div>
      )
      )}

      {/* Empty State - only show if no error */}
      {!error && resources.length === 0 && (
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
                    <p className="text-gray-600 text-sm mb-2">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-gray-500 text-xs mb-4">
                      or click to browse files (PDF only, max 50MB)
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
                  <label className="block text-sm font-medium text-black mb-2">Folder (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      list="folder-list"
                      placeholder="Type or select a folder"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    />
                    <datalist id="folder-list">
                      {folders.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </datalist>
                  </div>
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

              {/* Error Message */}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

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

      {/* Edit Resource Modal */}
      {editingResource && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setEditingResource(null);
            setEditForm({
              title: '',
              category: 'Uncategorized',
              folder: '',
              notes: '',
              author: '',
              priority: 'normal'
            });
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-black mb-2">Edit Resource</h2>
                  <p className="text-gray-600 text-sm">Update resource metadata</p>
                </div>
                <button
                  onClick={() => {
                    setEditingResource(null);
                    setEditForm({
                      title: '',
                      category: 'Uncategorized',
                      folder: '',
                      notes: '',
                      author: '',
                      priority: 'normal'
                    });
                  }}
                  className="text-gray-600 hover:text-black transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Author</label>
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      list="edit-category-list"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    />
                    <datalist id="edit-category-list">
                      <option value="Uncategorized">Uncategorized</option>
                      {categories.map(c => (
                        <option key={c.category} value={c.category}>{c.category}</option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Folder</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.folder}
                      onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                      list="edit-folder-list"
                      placeholder="Optional folder name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    />
                    <datalist id="edit-folder-list">
                      {folders.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Priority</label>
                  <div className="flex gap-2">
                    {['low', 'normal', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, priority: p })}
                        className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                          editForm.priority === p
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
                  <label className="block text-sm font-medium text-black mb-2">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-300">
                <button
                  onClick={() => {
                    setEditingResource(null);
                    setEditForm({
                      title: '',
                      category: 'Uncategorized',
                      folder: '',
                      notes: '',
                      author: '',
                      priority: 'normal'
                    });
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateResource}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-colors"
                >
                  Save Changes
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
function ResourceCard({ resource, onOpen, onDelete, onEdit }) {
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
            <span>{resource.progress > 0 ? 'Resume Reading' : 'Start Reading'}</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-black transition-all"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => onDelete(resource.id, e)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-600 transition-all"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

