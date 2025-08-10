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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Fetching user authentication status...');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (response.ok) {
        const statusData = await response.json();
        console.log('Auth status response:', statusData);
        
        if (statusData.authenticated && statusData.user) {
          setAuthState({
            user: statusData.user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.log('User not authenticated:', response.status, errorText);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: response.status >= 500 ? 'Server error' : null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Network error',
      });
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Login successful, response data:', responseData);
        
        // The server returns { success: true, user: userData }
        const userData = responseData.user || responseData;
        
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
      await fetch('/api/auth/logout', {
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