import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logoutUser, API_BASE } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the application to provide global authentication state.
 *
 * Manages:
 * - user object & JWT token
 * - Auto-login from localStorage on mount (Remember Me)
 * - login / logout / updateUser methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: try to restore session from localStorage ──
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem('pgps_token');
        const savedUser = localStorage.getItem('pgps_user');

        if (savedToken && savedUser) {
          // Validate token by fetching profile
          const response = await fetch(`${API_BASE}/user/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            setToken(savedToken);
            setUser(data.user);
          } else {
            // Token invalid/expired — clear storage
            localStorage.removeItem('pgps_token');
            localStorage.removeItem('pgps_user');
          }
        }
      } catch (error) {
        console.error('Session restore error:', error);
        localStorage.removeItem('pgps_token');
        localStorage.removeItem('pgps_user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login — store token & user in state + localStorage ──
  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('pgps_token', newToken);
    localStorage.setItem('pgps_user', JSON.stringify(newUser));
  }, []);

  // ── Logout — clear everything and redirect ──
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('API logout failed:', err);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('pgps_token');
    localStorage.removeItem('pgps_user');
  }, []);

  // ── Update user profile in state & localStorage ──
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pgps_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook — access the auth context from any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
