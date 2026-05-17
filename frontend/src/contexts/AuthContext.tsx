import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { AppSkeleton } from '../components/common/AppSkeleton';

interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  phone?: string;
  major?: string;
  yearOfStudy?: string;
  profilePicture?: { url: string; public_id: string };
  gender?: string;
  dateOfBirth?: string;
  program?: string;
  isAdmin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, remember?: boolean) => Promise<any>;
  loginWithGoogle: () => void;
  handleGoogleCallback: (token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<string | null>(null);
  const isRefreshingRef = useRef<boolean>(false); // Prevent concurrent refreshes

  const shouldRetryAuthRequest = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;

    const status = error.response?.status;
    if (!status) {
      // Network/transport errors are transient and worth retrying.
      return true;
    }

    // Do not retry client/auth errors.
    if (status >= 400 && status < 500) {
      return false;
    }

    // Retry 5xx server errors.
    return status >= 500;
  };

  // On mount, check both storages for a valid token
  useEffect(() => {
    const now = Date.now();
    const localToken = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');
    let persistedToken = null;

    if (localToken && expiry && now < Number(expiry)) {
      persistedToken = localToken;
    } else {
      // Clear potentially expired or invalid token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
    }

    // If no valid token from localStorage, check sessionStorage
    if (!persistedToken) {
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
        persistedToken = sessionToken;
      }
    }

    setToken(persistedToken);
    setInitializing(false);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProfile().catch(err => {
        console.error('Failed to fetch profile:', err);
        // If profile fetch fails, clear the token to prevent infinite loops
        if (err.response?.status === 401) {
          logout();
        }
      });
      // Set up token refresh
      setupTokenRefresh();
    } else {
      setUser(null);
      // Clear any existing refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  }, [token]);

  const setupTokenRefresh = () => {
    // Clear any existing refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Token expires in 24 hours, refresh 1 hour before expiry (23 hours)
    // If a stored expiry exists, calculate remaining time from now
    const storedExpiry = localStorage.getItem('token_expiry');
    let refreshTime: number;

    if (storedExpiry) {
      const expiresAt = Number(storedExpiry);
      const now = Date.now();
      const remaining = expiresAt - now;
      // Refresh 1 hour before expiry, but at least 30 seconds from now
      refreshTime = Math.max(remaining - 60 * 60 * 1000, 30 * 1000);
    } else {
      // Session token — refresh after 23 hours
      refreshTime = 23 * 60 * 60 * 1000;
    }
    
    const timeout = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    refreshTimeoutRef.current = timeout;
  };

  const refreshToken = async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping...');
      return;
    }

    try {
      isRefreshingRef.current = true;
      const currentToken = tokenRef.current;
      
      if (!currentToken) {
        console.log('No token available for refresh');
        return;
      }
      
      console.log('Refreshing authentication token...');
      const response = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      const { token: newToken } = response.data;
      setToken(newToken);
      
      // Update storage — respect original storage preference
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      if (sessionStorage.getItem('token')) {
        sessionStorage.setItem('token', newToken);
      } else {
        localStorage.setItem('token', newToken);
        localStorage.setItem('token_expiry', expiry.toString());
      }
      
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Only logout if the error is authentication-related
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      } else {
        // Reschedule token refresh if it was a network error or 5xx, to gracefully recover later
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, 5 * 60 * 1000); // 5 minutes
      }
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const fetchProfile = async () => {
    try {
      const currentToken = tokenRef.current;
      const response = await axios.get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
         logout();
      }
    }
  };

  const login = async (email: string, password: string, remember?: boolean) => {
    try {
      // Frontend validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Password validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Add retry logic for server wakeup scenarios
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await axios.post(`${API_BASE}/api/auth/login`, {
            email: email.toLowerCase(),
            password
          });
          const { token, user } = response.data;
          setToken(token);
          setUser(user);
          // Persist token based on remember preference
          const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          if (remember === false) {
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
          } else {
            localStorage.setItem('token', token);
            localStorage.setItem('token_expiry', expiry.toString());
            sessionStorage.removeItem('token');
          }
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error;
          if (attempt < 3 && shouldRetryAuthRequest(error)) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          } else {
            break;
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw lastError;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.data?.details) {
          const details = error.response.data.details;
          const errorMessages = Object.entries(details)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new Error('Server is starting up. Please try again in a few seconds.');
        }
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, remember?: boolean) => {
    try {
      // Frontend validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Password strength validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }

      if (!/[a-z]/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter');
      }

      if (!/[0-9]/.test(password)) {
        throw new Error('Password must contain at least one number');
      }

      if (!/[^A-Za-z\d\s]/.test(password)) {
        throw new Error('Password must contain at least one special character');
      }

      // Name validation
      if (name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      // Add retry logic for server wakeup scenarios
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await axios.post(`${API_BASE}/api/auth/signup`, {
            email: email.toLowerCase(),
            password,
            name: name.trim()
          });

          if (response.data.requireVerification) {
            return response.data;
          }

          const { token, user } = response.data;
          setToken(token);
          setUser(user);
          
          // Persist token based on remember preference
          const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
          if (remember === false) {
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
          } else {
            localStorage.setItem('token', token);
            localStorage.setItem('token_expiry', expiry.toString());
            sessionStorage.removeItem('token');
          }
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error;
          if (attempt < 3 && shouldRetryAuthRequest(error)) {
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          } else {
            break;
          }
        }
      }
      
      // If all retries failed, throw the last error
      throw lastError;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
        if (error.response?.data?.details) {
          const details = error.response.data.details;
          const errorMessages = Object.entries(details)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new Error('Server is starting up. Please try again in a few seconds.');
        }
      }
      throw error;
    }
  };

  // Remove token from both storages on logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    try {
      const formData = new FormData();
      
      for (const key in data) {
        const value = data[key as keyof Partial<User>];
        
        // Skip undefined values
        if (value === undefined) {
          continue;
        }
        
        // Handle null dateOfBirth
        if (key === 'dateOfBirth') {
          formData.append(key, value === null ? '' : String(value));
        } 
        // Handle File objects (profile picture upload)
        else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        }
        // Handle objects (like profilePicture metadata)
        else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        }
        // Handle primitive values
        else {
          formData.append(key, String(value));
        }
      }

      const response = await axios.put(`${API_BASE}/api/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => {
    setTimeout(() => {
      window.location.href = `${API_BASE}/api/auth/google`;
    }, 100);
  };

  const handleGoogleCallback = async (receivedToken: string) => {
    // Validate token format
    if (!receivedToken || typeof receivedToken !== 'string' || receivedToken.trim() === '') {
      console.error('Invalid token: empty or not a string');
      logout();
      return;
    }
    
    // Basic JWT format validation (three parts separated by dots)
    const tokenParts = receivedToken.trim().split('.');
    if (tokenParts.length !== 3) {
      console.error('Invalid JWT format: expected 3 parts');
      logout();
      return;
    }
    
    setToken(receivedToken);
    try {
      const response = await axios.get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${receivedToken}` }
      });
      setUser(response.data);
      // Always save token to localStorage with expiry for persistent login
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('token_expiry', expiry.toString());
      sessionStorage.removeItem('token');
    } catch (error) {
      console.error('Failed to fetch profile after Google login:', error);
      setUser(null);
      logout();
      throw error;
    }
  };

  // Only render children after token check is complete
  if (initializing) {
    return <AppSkeleton />;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      signup, 
      loginWithGoogle,
      handleGoogleCallback,
      logout, 
      updateProfile,
      loading: initializing,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 