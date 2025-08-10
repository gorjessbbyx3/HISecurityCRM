export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}
export const authUtils = {
  // Authentication utility functions
  getStoredToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setStoredToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  removeStoredToken: (): void => {
    localStorage.removeItem('auth_token');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};
