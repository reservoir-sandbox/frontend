import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthContextType } from '@/types/auth';
import { API_URL } from '@/utils/api';

const TOKEN_KEY = 'reservoir-bearer-token';
const TOKEN_EXPIRY_KEY = 'reservoir-token-expiry';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

interface DecodedToken {
  sub: string;
  exp: number;
  role?: string;
  [key: string]: any;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const decodeToken = (token: string): DecodedToken | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  };

  const setTokenWithExpiry = (token: string): void => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(decoded.exp * 1000));
    }
  };

  const fetchUserInfo = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/about_me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;

        if (newToken) {
          setTokenWithExpiry(newToken);
          return true;
        }
      }

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setUser(null);
        setIsAuthenticated(false);
      }

      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(
    async (navigateToLogin: boolean = true): Promise<void> => {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setUser(null);
        setIsAuthenticated(false);

        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          console.log('Logout request failed, but local session cleared');
        });

        if (navigateToLogin) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setUser(null);
        setIsAuthenticated(false);
        if (navigateToLogin) {
          navigate('/login');
        }
      }
    },
    [navigate]
  );

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry || Date.now() >= parseInt(expiry, 10)) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/about_me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        if (response.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken]);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        const token = data.access_token;
        setTokenWithExpiry(token);

        await fetchUserInfo();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'An error occurred during login',
        };
      }
    },
    [fetchUserInfo]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return;

      const timeLeft = parseInt(expiry, 10) - Date.now();

      if (timeLeft < 300000 && timeLeft > 0) {
        const success = await refreshToken();
        if (!success) {
          await logout(true);
        }
      }

      if (timeLeft <= 0) {
        await logout(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};