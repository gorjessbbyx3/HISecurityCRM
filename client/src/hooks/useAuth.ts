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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const checkAuthStatus = async () => {
    try {
      console.log('Fetching user authentication status...');
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          console.log('User authenticated:', data.user);
          setAuthState({
            user: data.user,
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
      } else {
        console.log('Auth status check failed');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Authentication check failed',
        });
      }
    } catch (error) {
      console.error('Auth status error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Network error',
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Check auth status periodically to handle session expiration
    const interval = setInterval(checkAuthStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  console.log('useAuth state:', authState);

  return {
    ...authState,
    refetch: checkAuthStatus,
  };
}