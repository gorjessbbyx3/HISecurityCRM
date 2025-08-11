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

  // Helper to set auth state
  const setAuthStateInternal = (state: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...state }));
  };

  // Get token from localStorage
  const getToken = () => localStorage.getItem('auth_token');
  
  // Set token in localStorage
  const setToken = (token: string) => {
    localStorage.setItem('auth_token', token);
  };
  
  // Remove token from localStorage
  const removeToken = () => {
    localStorage.removeItem('auth_token');
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Fetching user authentication status...');
      setAuthStateInternal({ isLoading: true, error: null });

      const token = getToken();
      if (!token) {
        setAuthStateInternal({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        return;
      }

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(fetchError => {
        console.error('Network error during auth check:', fetchError);
        throw new Error('Network error');
      });

      if (response.ok) {
        const data = await response.json().catch(jsonError => {
          console.error('JSON parse error:', jsonError);
          throw new Error('Invalid response format');
        });

        console.log('Auth status response:', data);

        if (data.authenticated && data.user) {
          setAuthStateInternal({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          console.log('User not authenticated');
          removeToken(); // Remove invalid token
          setAuthStateInternal({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } else {
        console.error('Auth status check failed:', response.status);
        if (response.status === 401 || response.status === 403) {
          removeToken(); // Remove invalid token
        }
        setAuthStateInternal({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: `Authentication check failed: ${response.status}`,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthStateInternal({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication check failed',
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setAuthStateInternal({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        setToken(data.token);
        setAuthStateInternal({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        setAuthStateInternal({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: data.message || 'Login failed',
        });
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthStateInternal({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local state regardless of API call result
      removeToken();
      setAuthStateInternal({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      return { success: true };
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  console.log('useAuth state:', authState);

  return {
    ...authState,
    checkAuthStatus,
    login,
    logout,
  };
}