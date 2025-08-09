import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      console.log("Fetching user authentication status...");
      const response = await fetch("/api/auth/user", {
        credentials: 'include'
      });
      console.log("Auth response status:", response.status);
      if (!response.ok) {
        console.log("Auth check failed:", response.status, response.statusText);
        throw new Error('Not authenticated');
      }
      const userData = await response.json();
      console.log("Auth successful, user data:", userData);
      return userData;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the result
  });

  const isAuthenticated = !!user && !error;
  console.log("Router state:", { isAuthenticated, isLoading });

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
