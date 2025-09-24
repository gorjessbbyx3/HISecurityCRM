import { useState, useEffect } from 'react';

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
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const login = async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
        return { success: true };
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: data.message || 'Login failed'
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  const checkAuthStatus = async () => {
    console.log('Checking authentication status...');
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/auth/me');

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Authentication status verified');
        console.log('useAuth state:', {
          user: data,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        setState({
          user: data.user || data,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Auth check failed'
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    login,
    logout,
    checkAuth: () => checkAuthStatus()
  };
}