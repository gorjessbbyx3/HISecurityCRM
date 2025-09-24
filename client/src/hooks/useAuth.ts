
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking authentication status...');
      setIsCheckingAuth(true);
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setUser(null);
        setError(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response:', contentType);
        const textResponse = await response.text();
        console.error('Response body:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON - authentication endpoint may be down');
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
        const userData = data.user;
        setUser(userData);
        setIsAuthenticated(true);
        setError(null);
        console.log('✅ Authentication status verified');
        console.log('useAuth state:', { user: data, isLoading: false, isAuthenticated: true, error: null });
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
        setError(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setError(error instanceof Error ? error.message : 'Authentication check failed');
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Login response body:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON during login');
      }

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setError(null);
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user: user,
    isLoading: isCheckingAuth || isLoading,
    isAuthenticated: isAuthenticated,
    error: error,
    login,
    logout,
    checkAuthStatus,
  };
}
