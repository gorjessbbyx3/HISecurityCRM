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
    console.log('Checking authentication status...');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthStateInternal({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setAuthStateInternal({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          console.log('✅ Authentication status verified');
        } else {
          localStorage.removeItem('auth_token');
          setAuthStateInternal({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired'
          });
        }
      } else {
        localStorage.removeItem('auth_token');
        setAuthStateInternal({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed'
        });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('auth_token');
      setAuthStateInternal({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Network error'
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    console.log('🔐 Attempting login for:', username);
    setAuthStateInternal({ user: null, isLoading: true, isAuthenticated: false, error: null });

    try {
      const loginData = { username, password };
      console.log('Sending login data:', loginData);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Login failed (${response.status})` };
        }

        throw new Error(errorData.message || 'Login failed');
      }

      const responseText = await response.text();
      console.log('Login response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse login response:', parseError);
        throw new Error('Invalid server response');
      }

      if (data.success && data.token && data.user) {
        localStorage.setItem('auth_token', data.token);
        setAuthStateInternal({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        console.log('✅ Login successful - redirecting to dashboard');
        
        // Force a small delay to ensure state is updated before redirect
        setTimeout(() => {
          console.log('🎯 Authentication state updated');
        }, 100);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setAuthStateInternal({ user: null, isLoading: false, isAuthenticated: false, error: errorMessage });
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
    // Only check auth status on mount if we don't have a current auth state
    const token = localStorage.getItem('auth_token');
    if (token && !authState.isAuthenticated) {
      checkAuthStatus();
    } else if (!token) {
      setAuthStateInternal({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, [checkAuthStatus, authState.isAuthenticated]);

  console.log('useAuth state:', authState);

  return {
    ...authState,
    checkAuthStatus,
    login,
    logout,
  };
}