import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Auth check: Non-JSON response:', text);
        setUser(null);
        setLoading(false);
        return;
      }

      const text = await response.text();
      if (!text || text.trim() === '') {
        setUser(null);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Auth check: Invalid JSON:', text);
        setUser(null);
        setLoading(false);
        return;
      }
      
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok and has content
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Login failed';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response. Please check if the server is running. Response: ${text.substring(0, 100)}`);
      }

      // Parse JSON response
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Server returned an empty response. Please check if the server is running.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`);
      }

      setUser(data.user);
      return data;
    } catch (error) {
      // If it's already our custom error, re-throw it
      if (error.message && !error.message.includes('fetch')) {
        throw error;
      }
      // Network or fetch errors
      throw new Error('Unable to connect to server. Please make sure the server is running on port 3000.');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      // Check if response is ok and has content
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Signup failed';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response. Please check if the server is running. Response: ${text.substring(0, 100)}`);
      }

      // Parse JSON response
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Server returned an empty response. Please check if the server is running.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`);
      }

      setUser(data.user);
      return data;
    } catch (error) {
      // If it's already our custom error, re-throw it
      if (error.message && !error.message.includes('fetch')) {
        throw error;
      }
      // Network or fetch errors
      throw new Error('Unable to connect to server. Please make sure the server is running on port 3000.');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data.profile);
    }

    return data;
  };

  const updateOnboarding = async (step, data) => {
    const response = await fetch('/api/profile/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ step, data }),
    });

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      console.error('Session expired during onboarding. Redirecting to login...');
      setUser(null);
      // Don't throw error, let the caller handle it
      return { error: 'Session expired. Please log in again.', unauthorized: true };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to save onboarding data' }));
      throw new Error(errorData.error || 'Failed to save onboarding data');
    }

    const result = await response.json();

    if (result.profile) {
      setUser(result.profile);
    }

    return result;
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    updateOnboarding,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;






