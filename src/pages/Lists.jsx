import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Lists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [lists, setLists] = useState([]);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create list form state
  const [listName, setListName] = useState('');
  const [listIcon, setListIcon] = useState('📋');
  const [listDescription, setListDescription] = useState('');
  const [listCoverImage, setListCoverImage] = useState(null);
  const [listImagePreview, setListImagePreview] = useState(null);
  const [uploadingListImage, setUploadingListImage] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editListForm, setEditListForm] = useState({
    name: '',
    icon: '📋',
    description: '',
    cover_image_url: null,
    is_pinned: false,
    is_shared: false
  });
  const [editListImagePreview, setEditListImagePreview] = useState(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const icons = ['📋', '🎬', '📚', '🌍', '💡', '🛒', '🎯', '📝', '⭐', '🔥'];

  useEffect(() => {
    if (!id) {
      fetchLists();
    }
  }, [filter, searchQuery, id]);

  const fetchLists = async () => {
    try {
      const filterParam = filter === 'all' ? '' : filter;
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const url = `/api/lists${filterParam ? `?filter=${filterParam}` : ''}${searchParam ? (filterParam ? '&' : '?') + searchParam.replace('&', '') : ''}`;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
      } else {
        console.error('Failed to fetch lists:', response.status, response.statusText);
        // If 404, the route might not be registered - show helpful message
        if (response.status === 404) {
          const text = await response.text();
          if (text.includes('<!DOCTYPE')) {
            console.error('API route not found. Please restart the server.');
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: listName.trim(),
          icon: listIcon,
          description: listDescription.trim() || null,
          cover_image_url: listCoverImage || null,
        }),
      });

      console.log('Create list response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setListName('');
        setListIcon('📋');
        setListDescription('');
        setListCoverImage(null);
        setListImagePreview(null);
        // Navigate to the new list
        navigate(`/lists/${data.list.id}`);
      } else {
        // Try to parse error, but handle HTML responses
        let errorMessage = 'Failed to create list';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          // If response is not JSON (might be HTML 404 page)
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          if (response.status === 404) {
            errorMessage = 'API endpoint not found. Please restart the server.';
          } else {
            errorMessage = `Server error (${response.status}). Please check the console.`;
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Create list error:', error);
      alert(`Failed to create list: ${error.message}`);
    }
  };

  const handleDeleteList = async (listId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setLists(prev => prev.filter(l => l.id !== listId));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete list');
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setEditListForm({
      name: list.name || '',
      icon: list.icon || '📋',
      description: list.description || '',
      cover_image_url: list.cover_image_url || null,
      is_pinned: list.is_pinned || false,
      is_shared: list.is_shared || false
    });
    setEditListImagePreview(list.cover_image_url || null);
  };

  const handleUpdateList = async () => {
    if (!editingList || !editListForm.name.trim()) return;

    try {
      const response = await fetch(`/api/lists/${editingList.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editListForm),
      });

      if (response.ok) {
        setEditingList(null);
        setEditListForm({
          name: '',
          icon: '📋',
          description: '',
          cover_image_url: null,
          is_pinned: false,
          is_shared: false
        });
        setEditListImagePreview(null);
        await fetchLists();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update list');
      }
    } catch (error) {
      console.error('Update list error:', error);
      alert('Failed to update list');
    }
  };

  const handleTogglePin = async (listId, currentPinned) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_pinned: !currentPinned }),
      });

      if (response.ok) {
        await fetchLists();
      }
    } catch (error) {
      console.error('Toggle pin error:', error);
    }
  };

  const handleToggleShare = async (listId, currentShared) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_shared: !currentShared }),
      });

      if (response.ok) {
        await fetchLists();
      }
    } catch (error) {
      console.error('Toggle share error:', error);
    }
  };

  const getProgressPercentage = (list) => {
    const total = parseInt(list.total_items) || 0;
    const completed = parseInt(list.completed_items) || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // If viewing a specific list, show ListDetail component
  if (id) {
    return <ListDetail listId={id} onBack={() => navigate('/lists')} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading lists...</p>
      </div>
    );
  }

  const filteredLists = lists.filter(list => {
    if (filter === 'pinned') return list.is_pinned;
    if (filter === 'shared') return list.is_shared;
    if (filter === 'recent') {
      const updated = new Date(list.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updated >= weekAgo;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-black mb-2">My Lists</h1>
          <p className="text-gray-600 text-lg">Manage your personal intentions and collections.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-xl">+</span>
          <span>Create New List</span>
        </button>
      </div>

      {/* Navigation/Filter Bar */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-300 pb-4">
        {['all', 'recent', 'pinned', 'shared'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-medium transition-colors pb-2 capitalize ${
              filter === f
                ? 'text-black border-b-2 border-ofa-ink'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {f === 'all' ? 'All Lists' : f}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600 text-sm">
          Showing {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'}
        </p>
        <div className="flex items-center gap-4">
          {/* View Toggles */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lists..."
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink text-sm"
          />
        </div>
      </div>

      {/* Lists Grid */}
      {filteredLists.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-600 text-lg mb-2">Start a new collection</p>
          <p className="text-gray-500 text-sm mb-6">
            Organize your thoughts, plans, and inspirations into beautifully structured lists.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black transition-colors flex items-center gap-2 mx-auto"
          >
            <span className="text-xl">+</span>
            <span>Create New List</span>
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onOpen={() => navigate(`/lists/${list.id}`)}
              onDelete={handleDeleteList}
              onEdit={handleEditList}
              onTogglePin={handleTogglePin}
              onToggleShare={handleToggleShare}
              progress={getProgressPercentage(list)}
              timeAgo={getTimeAgo(list.updated_at)}
            />
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowCreateModal(false);
            setListName('');
            setListIcon('📋');
            setListDescription('');
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-black mb-2">Create New List</h2>
                  <p className="text-gray-600 text-sm">
                    Organize your thoughts and intentions. Give your list a name, an icon, and a clear purpose.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setListName('');
                    setListIcon('📋');
                    setListDescription('');
                    setListCoverImage(null);
                    setListImagePreview(null);
                  }}
                  className="text-gray-600 hover:text-black transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">List Name</label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="e.g. Weekly Intentions, Reading List..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Visual Representation</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setListIcon(icon)}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                          listIcon === icon
                            ? 'border-ofa-ink bg-black/10'
                            : 'border-gray-300 hover:border-ofa-ink'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    placeholder="Describe the objective of this list..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Cover Image <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="space-y-3">
                    {listImagePreview ? (
                      <div className="relative">
                        <img 
                          src={listImagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-xl border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setListImagePreview(null);
                            setListCoverImage(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setUploadingListImage(true);
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                const response = await fetch('/api/upload/image', {
                                  method: 'POST',
                                  credentials: 'include',
                                  body: formData,
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  setListCoverImage(data.url);
                                  setListImagePreview(data.url);
                                } else {
                                  alert('Failed to upload image');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                alert('Failed to upload image');
                              } finally {
                                setUploadingListImage(false);
                              }
                            }
                          }}
                          disabled={uploadingListImage}
                        />
                      </label>
                    )}
                    {uploadingListImage && (
                      <div className="text-center text-sm text-gray-500">
                        Uploading image...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-300">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setListName('');
                    setListIcon('📋');
                    setListDescription('');
                    setListCoverImage(null);
                    setListImagePreview(null);
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={!listName.trim()}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 disabled:opacity-50 transition-colors"
                >
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit List Modal */}
      {editingList && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setEditingList(null);
            setEditListForm({
              name: '',
              icon: '📋',
              description: '',
              cover_image_url: null,
              is_pinned: false,
              is_shared: false
            });
            setEditListImagePreview(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-black mb-2">Edit List</h2>
                  <p className="text-gray-600 text-sm">Update your list details.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingList(null);
                    setEditListForm({
                      name: '',
                      icon: '📋',
                      description: '',
                      cover_image_url: null,
                      is_pinned: false,
                      is_shared: false
                    });
                    setEditListImagePreview(null);
                  }}
                  className="text-gray-600 hover:text-black transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">List Name</label>
                  <input
                    type="text"
                    value={editListForm.name}
                    onChange={(e) => setEditListForm({ ...editListForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Icon</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditListForm({ ...editListForm, icon })}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                          editListForm.icon === icon
                            ? 'border-ofa-ink bg-black/10'
                            : 'border-gray-300 hover:border-ofa-ink'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Description</label>
                  <textarea
                    value={editListForm.description}
                    onChange={(e) => setEditListForm({ ...editListForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Cover Image</label>
                  <div className="space-y-3">
                    {editListImagePreview ? (
                      <div className="relative">
                        <img 
                          src={editListImagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-xl border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditListImagePreview(null);
                            setEditListForm({ ...editListForm, cover_image_url: null });
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-500">Click to upload image</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setUploadingEditImage(true);
                              try {
                                const formData = new FormData();
                                formData.append('image', file);
                                
                                const response = await fetch('/api/upload/image', {
                                  method: 'POST',
                                  credentials: 'include',
                                  body: formData,
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  setEditListForm({ ...editListForm, cover_image_url: data.url });
                                  setEditListImagePreview(data.url);
                                } else {
                                  alert('Failed to upload image');
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                alert('Failed to upload image');
                              } finally {
                                setUploadingEditImage(false);
                              }
                            }
                          }}
                          disabled={uploadingEditImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editListForm.is_pinned}
                      onChange={(e) => setEditListForm({ ...editListForm, is_pinned: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-black">Pin to top</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editListForm.is_shared}
                      onChange={(e) => setEditListForm({ ...editListForm, is_shared: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-black">Share list</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-300">
                <button
                  onClick={() => {
                    setEditingList(null);
                    setEditListForm({
                      name: '',
                      icon: '📋',
                      description: '',
                      cover_image_url: null,
                      is_pinned: false,
                      is_shared: false
                    });
                    setEditListImagePreview(null);
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateList}
                  disabled={!editListForm.name.trim()}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-black/90 disabled:opacity-50 transition-colors"
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

// List Card Component
function ListCard({ list, onOpen, onDelete, onEdit, onTogglePin, onToggleShare, progress, timeAgo }) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-black cursor-pointer transition-all duration-200 group relative"
      onClick={onOpen}
    >
      {/* Icon Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#000000' }}>
          {list.icon || '📋'}
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-28 relative overflow-hidden bg-gray-50">
        {list.cover_image_url ? (
          <img 
            src={list.cover_image_url} 
            alt={list.name}
            className="w-full h-full object-cover"
          />
        ) : null}
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: '#000000' }}
          />
        </div>
        
        {/* Progress Percentage Badge */}
        {progress > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-white rounded">
            <span className="text-xs text-black" style={{ color: '#000000' }}>{progress}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base text-black mb-2 line-clamp-2" style={{ color: '#000000' }}>{list.name}</h3>
        
        {list.description && (
          <p className="text-sm text-black mb-3 line-clamp-2" style={{ color: '#000000', opacity: 0.6 }}>{list.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
              <span className="text-xs text-black" style={{ color: '#000000' }}>{list.total_items || 0} items</span>
            </div>
            {list.completed_items > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded">
                <span className="text-xs text-black" style={{ color: '#000000' }}>{list.completed_items} done</span>
              </div>
            )}
          </div>
          <span className="text-xs text-black" style={{ color: '#000000', opacity: 0.5 }}>{timeAgo}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#e5e5e5' }}>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(list.id, list.is_pinned);
              }}
              className={`p-1.5 rounded hover:bg-gray-100 transition-all ${
                list.is_pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title={list.is_pinned ? 'Unpin list' : 'Pin list'}
            >
              <svg className={`w-4 h-4 ${list.is_pinned ? 'text-black fill-current' : 'text-gray-400'}`} fill={list.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleShare(list.id, list.is_shared);
              }}
              className={`p-1.5 rounded hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 ${
                list.is_shared ? 'opacity-100' : ''
              }`}
              title={list.is_shared ? 'Unshare list' : 'Share list'}
            >
              <svg className={`w-4 h-4 ${list.is_shared ? 'text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(list);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-gray-100 transition-all"
              title="Edit list"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => onDelete(list.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-gray-100 transition-all"
              style={{ color: '#000000' }}
              title="Delete list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// List Detail Component (for viewing/editing items in a list)
function ListDetail({ listId, onBack }) {
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNote, setNewItemNote] = useState('');
  const [newItemTag, setNewItemTag] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemForm, setEditingItemForm] = useState({ title: '', note: '', tag: '' });
  const [itemFilter, setItemFilter] = useState('all'); // all, active, completed, tagged
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [draggedOverItemId, setDraggedOverItemId] = useState(null);

  useEffect(() => {
    fetchList();
  }, [listId]);

  const fetchList = async () => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setList(data.list);
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newItemTitle.trim(),
          note: newItemNote.trim() || null,
          tag: newItemTag.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setItems(prev => [...prev, data.item]);
        setNewItemTitle('');
        setNewItemNote('');
        setNewItemTag('');
        setShowAddItem(false);
        fetchList(); // Refresh to get updated counts
      }
    } catch (error) {
      console.error('Add item error:', error);
      alert('Failed to add item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingItemForm({
      title: item.title || '',
      note: item.note || '',
      tag: item.tag || ''
    });
  };

  const handleUpdateItem = async (itemId) => {
    try {
      const response = await fetch(`/api/lists/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingItemForm),
      });

      if (response.ok) {
        setEditingItemId(null);
        setEditingItemForm({ title: '', note: '', tag: '' });
        await fetchList();
      }
    } catch (error) {
      console.error('Update item error:', error);
      alert('Failed to update item');
    }
  };

  const handleReorderItems = async (orderedItemIds) => {
    try {
      const response = await fetch(`/api/lists/${listId}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedItemIds }),
      });

      if (response.ok) {
        await fetchList();
      }
    } catch (error) {
      console.error('Reorder error:', error);
    }
  };

  const handleBulkComplete = async () => {
    const activeItems = items.filter(item => !item.is_done);
    if (activeItems.length === 0) return;

    try {
      await Promise.all(
        activeItems.map(item =>
          fetch(`/api/lists/items/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_done: true }),
          })
        )
      );
      await fetchList();
    } catch (error) {
      console.error('Bulk complete error:', error);
    }
  };

  const handleClearCompleted = async () => {
    const completedItems = items.filter(item => item.is_done);
    if (completedItems.length === 0) return;
    if (!confirm(`Delete ${completedItems.length} completed item(s)?`)) return;

    try {
      await Promise.all(
        completedItems.map(item =>
          fetch(`/api/lists/items/${item.id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );
      await fetchList();
    } catch (error) {
      console.error('Clear completed error:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete all ${items.length} item(s)? This cannot be undone.`)) return;

    try {
      await Promise.all(
        items.map(item =>
          fetch(`/api/lists/items/${item.id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );
      await fetchList();
    } catch (error) {
      console.error('Delete all error:', error);
    }
  };

  const handleToggleItem = async (itemId, currentDone) => {
    try {
      const response = await fetch(`/api/lists/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_done: !currentDone }),
      });

      if (response.ok) {
        fetchList();
      }
    } catch (error) {
      console.error('Toggle item error:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/lists/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== itemId));
        fetchList();
      }
    } catch (error) {
      console.error('Delete item error:', error);
    }
  };

  // Filter and search items
  const filteredItems = items.filter(item => {
    // Filter by status
    if (itemFilter === 'active' && item.is_done) return false;
    if (itemFilter === 'completed' && !item.is_done) return false;
    if (itemFilter === 'tagged' && !item.tag) return false;

    // Search query
    if (itemSearchQuery) {
      const query = itemSearchQuery.toLowerCase();
      const matchesTitle = item.title?.toLowerCase().includes(query);
      const matchesNote = item.note?.toLowerCase().includes(query);
      const matchesTag = item.tag?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesNote && !matchesTag) return false;
    }

    return true;
  });

  const activeItems = filteredItems.filter(item => !item.is_done);
  const completedItems = filteredItems.filter(item => item.is_done);

  // Drag and drop handlers
  const handleDragStart = (e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, itemId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (itemId !== draggedItemId) {
      setDraggedOverItemId(itemId);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverItemId(null);
  };

  const handleDrop = async (e, targetItemId) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDraggedOverItemId(null);
      return;
    }

    const draggedItem = items.find(item => item.id === draggedItemId);
    const targetItem = items.find(item => item.id === targetItemId);
    if (!draggedItem || !targetItem) return;

    // Reorder items: move dragged item to target position
    const reorderedItems = [...items];
    const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItemId);
    const targetIndex = reorderedItems.findIndex(item => item.id === targetItemId);
    
    reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);

    // Update positions and send to backend
    const orderedItemIds = reorderedItems.map(item => item.id);
    await handleReorderItems(orderedItemIds);

    setDraggedItemId(null);
    setDraggedOverItemId(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">Loading list...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-600">List not found</p>
        <button onClick={onBack} className="mt-4 text-black hover:text-black">
          ← Back to Lists
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 pb-32">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-black mb-4 flex items-center gap-2"
        >
          <span>←</span>
          <span>Back to Lists</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl text-black mb-2 flex items-center gap-3">
              {list.icon && <span>{list.icon}</span>}
              <span>{list.name}</span>
            </h1>
            {list.description && (
              <p className="text-gray-600">{list.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {items.filter(i => !i.is_done).length} REMAINING • {items.filter(i => i.is_done).length} DONE
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={itemSearchQuery}
            onChange={(e) => setItemSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
          />
          <div className="flex items-center gap-2">
            {['all', 'active', 'completed', 'tagged'].map((filter) => (
              <button
                key={filter}
                onClick={() => setItemFilter(filter)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                  itemFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              disabled={items.filter(i => !i.is_done).length === 0}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Mark All Done
            </button>
            <button
              onClick={handleClearCompleted}
              disabled={items.filter(i => i.is_done).length === 0}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Clear Completed
            </button>
            <button
              onClick={handleDeleteAll}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete All
            </button>
          </div>
        )}
      </div>

      {/* Active Items */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-600 uppercase mb-4">Active Items</h2>
        <div className="space-y-2">
          {activeItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-2">No active items</p>
              {itemSearchQuery || itemFilter !== 'all' ? (
                <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
              ) : (
                <p className="text-xs text-gray-400">Add your first item below</p>
              )}
            </div>
          ) : (
            activeItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                isEditing={editingItemId === item.id}
                editingForm={editingItemForm}
                onEdit={() => handleEditItem(item)}
                onUpdate={() => handleUpdateItem(item.id)}
                onCancel={() => {
                  setEditingItemId(null);
                  setEditingItemForm({ title: '', note: '', tag: '' });
                }}
                onFormChange={setEditingItemForm}
                onToggle={() => handleToggleItem(item.id, item.is_done)}
                onDelete={() => handleDeleteItem(item.id)}
                isDragging={draggedItemId === item.id}
                isDraggedOver={draggedOverItemId === item.id}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div className="mb-8">
          <details className="group">
            <summary className="text-sm font-medium text-gray-600 uppercase mb-4 cursor-pointer flex items-center gap-2">
              <span>▼</span>
              <span>Completed ({completedItems.length})</span>
            </summary>
            <div className="space-y-2 mt-4">
              {completedItems.map((item) => (
                <ListItem
                  key={item.id}
                  item={item}
                  isEditing={editingItemId === item.id}
                  editingForm={editingItemForm}
                  onEdit={() => handleEditItem(item)}
                  onUpdate={() => handleUpdateItem(item.id)}
                  onCancel={() => {
                    setEditingItemId(null);
                    setEditingItemForm({ title: '', note: '', tag: '' });
                  }}
                  onFormChange={setEditingItemForm}
                  onToggle={() => handleToggleItem(item.id, item.is_done)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Add Item Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4">
        <div className="max-w-4xl mx-auto">
          {showAddItem ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  } else if (e.key === 'Escape') {
                    setShowAddItem(false);
                    setNewItemTitle('');
                    setNewItemNote('');
                  }
                }}
                placeholder="Item name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink"
                autoFocus
              />
              <input
                type="text"
                value={newItemNote}
                onChange={(e) => setNewItemNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
                placeholder="Note (optional)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink text-sm"
              />
              <input
                type="text"
                value={newItemTag}
                onChange={(e) => setNewItemTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
                placeholder="Tag (optional)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-ofa-ink text-sm"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItemTitle('');
                    setNewItemNote('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItemTitle.trim()}
                  className="px-6 py-2 bg-black text-white rounded-xl hover:bg-black disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 text-gray-600"
            >
              <span>+</span>
              <span>Add a new item or press CMD + N...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// List Item Component
function ListItem({ 
  item, 
  isEditing = false,
  editingForm = { title: '', note: '', tag: '' },
  onEdit,
  onUpdate,
  onCancel,
  onFormChange,
  onToggle, 
  onDelete,
  isDragging = false,
  isDraggedOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  if (isEditing) {
    return (
      <div className="p-3 bg-white rounded-xl border-2 border-black">
        <div className="space-y-2">
          <input
            type="text"
            value={editingForm.title}
            onChange={(e) => onFormChange({ ...editingForm, title: e.target.value })}
            placeholder="Item title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            autoFocus
          />
          <input
            type="text"
            value={editingForm.note}
            onChange={(e) => onFormChange({ ...editingForm, note: e.target.value })}
            placeholder="Note (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
          />
          <input
            type="text"
            value={editingForm.tag}
            onChange={(e) => onFormChange({ ...editingForm, tag: e.target.value })}
            placeholder="Tag (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              onClick={onUpdate}
              disabled={!editingForm.title.trim()}
              className="px-4 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={!item.is_done}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex items-start gap-3 p-3 bg-gray-100 rounded-xl border border-gray-300 hover:bg-white transition-colors group ${
        isDragging ? 'opacity-50' : ''
      } ${isDraggedOver ? 'border-black border-2' : ''}`}
    >
      {!item.is_done && (
        <div className="mt-1 cursor-move text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      <button
        onClick={onToggle}
        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
          item.is_done
            ? 'bg-black border-black'
            : 'border-gray-300 hover:border-black'
        }`}
      >
        {item.is_done && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-black ${item.is_done ? 'line-through text-gray-500' : ''}`}>
          {item.title}
        </p>
        {item.note && (
          <p className="text-sm text-gray-600 mt-1">{item.note}</p>
        )}
        {item.tag && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
            {item.tag}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-black transition-all"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-600 transition-all"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

