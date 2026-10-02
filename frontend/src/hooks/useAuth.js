import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useAuthContext();
  if (!context) {
    // Fallback if rendered outside AuthProvider
    const token = localStorage.getItem('mindcraft_token');
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('mindcraft_user'));
    } catch {
      user = null;
    }
    return {
      user,
      token,
      isAuthenticated: !!token && !!user,
      role: user?.role || 'participant',
      loading: false,
      error: null,
      login: async () => {},
      adminLogin: async () => {},
      logout: () => {
        localStorage.removeItem('mindcraft_token');
        localStorage.removeItem('mindcraft_user');
      },
    };
  }
  return context;
}
