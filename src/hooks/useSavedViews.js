import { useState, useEffect } from 'react';

/**
 * Hook for managing saved views in localStorage
 * @param {string} collectionKey - Unique key for the collection (e.g., 'projects', 'library')
 */
export function useSavedViews(collectionKey) {
  const storageKey = `wma.views.${collectionKey}`;

  const [views, setViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);

  // Load views from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setViews(parsed.views || []);
        setActiveViewId(parsed.activeViewId || null);
      }
    } catch (error) {
      console.error('Failed to load saved views:', error);
    }
  }, [storageKey]);

  // Save views to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        views,
        activeViewId
      }));
    } catch (error) {
      console.error('Failed to save views:', error);
    }
  }, [views, activeViewId, storageKey]);

  const getViews = () => views;

  const getActiveView = () => {
    if (!activeViewId) return null;
    return views.find(v => v.id === activeViewId) || null;
  };

  const addView = (view) => {
    const newView = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: view.name || 'Untitled View',
      viewType: view.viewType || 'table',
      filters: view.filters || {},
      sort: view.sort || {},
      group: view.group || null,
      columns: view.columns || [],
      search: view.search || '',
      ...view
    };
    setViews(prev => [...prev, newView]);
    return newView.id;
  };

  const updateView = (id, patch) => {
    setViews(prev => prev.map(v => 
      v.id === id ? { ...v, ...patch } : v
    ));
  };

  const deleteView = (id) => {
    setViews(prev => prev.filter(v => v.id !== id));
    if (activeViewId === id) {
      setActiveViewId(null);
    }
  };

  const setActiveView = (id) => {
    setActiveViewId(id);
  };

  const saveCurrentAsView = (name, currentState) => {
    const viewId = addView({
      name,
      viewType: currentState.viewType,
      filters: currentState.filters || {},
      sort: currentState.sort || {},
      group: currentState.group || null,
      columns: currentState.columns || [],
      search: currentState.search || ''
    });
    setActiveViewId(viewId);
    return viewId;
  };

  return {
    views,
    activeViewId,
    getViews,
    getActiveView,
    addView,
    updateView,
    deleteView,
    setActiveView,
    saveCurrentAsView
  };
}
