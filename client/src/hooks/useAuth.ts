import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      console.log('Fetching user authentication status...');
      const response = await fetch("/api/auth/user", {
        credentials: 'include'
      });
      console.log('Auth response status:', response.status);
      if (!response.ok) {
        console.log('Auth check failed:', response.status, response.statusText);
        throw new Error('Not authenticated');
      }
      const userData = await response.json();
      console.log('Auth successful, user data:', userData);
      return userData;
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.message === 'Not authenticated') {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const isAuthenticated = !!user && !error;

  console.log('useAuth state:', { user, isLoading, isAuthenticated, error });

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
