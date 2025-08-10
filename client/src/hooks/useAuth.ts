import { useState, useEffect } from 'react';
import { authUtils } from '@/lib/authUtils';

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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Fetching user authentication status...');
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User authenticated:', userData);
        setAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        console.log('User not authenticated');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to check authentication',
      });
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Login successful, user data:', userData);
        setAuthState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return true;
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error || 'Login failed',
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error during login',
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  };

  console.log('useAuth state:', authState);

  return {
    ...authState,
    checkAuthStatus,
    login,
    logout,
  };
}