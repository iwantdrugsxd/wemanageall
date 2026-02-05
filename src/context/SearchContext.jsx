import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(null);
  const location = useLocation();

  // Auto-detect scope from route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/projects')) {
      setScope('projects');
    } else if (path.startsWith('/library') || path.startsWith('/resources')) {
      setScope('library');
    } else if (path.startsWith('/lists')) {
      setScope('lists');
    } else {
      setScope(null);
    }
  }, [location.pathname]);

  const clearQuery = () => {
    setQuery('');
  };

  const value = {
    query,
    setQuery,
    clearQuery,
    scope,
    setScope
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
