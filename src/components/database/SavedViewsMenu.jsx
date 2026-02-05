import { useState } from 'react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';
import Input from '../ui/Input';
import IconButton from '../ui/IconButton';
// Icons are inline SVG paths

/**
 * Saved Views Menu - Component for managing saved views
 */
export default function SavedViewsMenu({
  savedViews,
  onSaveCurrent,
  className
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleSaveCurrent = () => {
    if (!newViewName.trim()) return;
    if (onSaveCurrent) {
      onSaveCurrent(newViewName.trim());
      setNewViewName('');
      setShowCreate(false);
    }
  };

  const handleStartEdit = (view) => {
    setEditingId(view.id);
    setEditingName(view.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim() || !editingId) return;
    savedViews.updateView(editingId, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this view?')) {
      savedViews.deleteView(id);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {!showCreate ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save Current View
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="View name"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveCurrent();
              if (e.key === 'Escape') {
                setShowCreate(false);
                setNewViewName('');
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveCurrent} className="flex-1">
              Save
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowCreate(false);
                setNewViewName('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {savedViews.getViews().map(view => (
          <div
            key={view.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-[var(--bg-surface)]"
          >
            {editingId === view.id ? (
              <>
                <Input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingName('');
                    }
                  }}
                  className="flex-1"
                  autoFocus
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEdit}
                  aria-label="Save"
                >
                  ✓
                </IconButton>
              </>
            ) : (
              <>
                <span
                  className="flex-1 text-sm cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => savedViews.setActiveView(view.id)}
                >
                  {view.name}
                </span>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(view)}
                  aria-label="Edit view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(view.id)}
                  aria-label="Delete view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </IconButton>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
