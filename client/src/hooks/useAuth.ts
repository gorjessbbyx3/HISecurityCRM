import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      console.log('Fetching user authentication status...');

      try {
        // First try the status endpoint
        const statusResponse = await fetch("/api/auth/status", {
          credentials: 'include'
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.authenticated && statusData.user) {
            console.log('Auth status check successful:', statusData.user);
            return statusData.user;
          }
        }

        // If not authenticated, return null instead of throwing
        console.log('User not authenticated');
        return null;
      } catch (error) {
        console.error('Auth check error:', error);
        return null;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error && error.message === 'Not authenticated') {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 1 * 1000, // Cache for 1 second in development to get fresh auth state
    gcTime: 10 * 1000, // Keep in cache for 10 seconds
  });

  const isAuthenticated = !!user && !error;

  console.log('useAuth state:', { user, isLoading, isAuthenticated, error });

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}