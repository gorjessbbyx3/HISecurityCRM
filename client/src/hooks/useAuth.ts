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

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Fetching user authentication status...');
      setAuthStateInternal({ isLoading: true, error: null });

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
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
          setAuthStateInternal({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } else {
        console.error('Auth status check failed:', response.status);
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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setAuthStateInternal({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      }).catch(fetchError => {
        console.error('Network error during login:', fetchError);
        throw new Error('Network connection failed');
      });

      const data = await response.json().catch(jsonError => {
        console.error('JSON parse error during login:', jsonError);
        throw new Error('Invalid server response');
      });

      if (data.success) {
        setAuthStateInternal({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return { success: true };
      } else {
        const errorMsg = data.error || 'Login failed';
        console.error('Login failed:', errorMsg);
        setAuthStateInternal({
          ...authState,
          isLoading: false,
          error: errorMsg,
        });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      setAuthStateInternal({
        ...authState,
        isLoading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      setAuthStateInternal({ isLoading: true });

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(fetchError => {
        console.error('Network error during logout:', fetchError);
        // Continue with local logout even if network fails
      });

      setAuthStateInternal({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
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
  }, [checkAuthStatus]); // Depend on checkAuthStatus

  console.log('useAuth state:', authState);

  return {
    ...authState,
    checkAuthStatus,
    login,
    logout,
  };
}