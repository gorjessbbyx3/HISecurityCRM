import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setError(null);
        return { success: true };
      } else {
        setError(data.message || 'Login failed');
        setUser(null);
        setIsAuthenticated(false);
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
  };

  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking authentication status...');
      setIsCheckingAuth(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setUser(null);
        setError(null);
        return;
      }

      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - expected JSON');
      }

      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user || data); // Assuming data.user or data itself contains user info
        setError(null);
        setIsAuthenticated(true);
        console.log('✅ Authentication status verified');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      localStorage.removeItem('auth_token');
    } finally {
      setIsCheckingAuth(false);
      setIsLoading(false); // Ensure loading is set to false after auth check
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Depend on checkAuth

  return {
    user: user,
    isLoading: isCheckingAuth,
    isAuthenticated: isAuthenticated,
    error: error,
    login,
    logout,
    checkAuth
  };
}