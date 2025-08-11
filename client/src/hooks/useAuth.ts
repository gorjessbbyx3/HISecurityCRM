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

  // Renamed setUser, setIsLoading, setIsAuthenticated, setError to match the original hook's internal state management
  const setUser = (user: User | null) => setAuthStateInternal({ user });
  const setIsLoading = (isLoading: boolean) => setAuthStateInternal({ isLoading });
  const setIsAuthenticated = (isAuthenticated: boolean) => setAuthStateInternal({ isAuthenticated });
  const setError = (error: string | null) => setAuthStateInternal({ error });


  const checkAuthStatus = useCallback(async () => {
    console.log('Fetching user authentication status...');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setError(null);
        } else {
          localStorage.removeItem('auth_token');
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired');
        }
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      setError('Network error');
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setAuthStateInternal({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
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
        return true; // Return boolean for success
      } else {
        setAuthStateInternal({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: data.message || 'Login failed',
        });
        return false; // Return boolean for failure
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