import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) ||
        JSON.parse(sessionStorage.getItem(STORAGE_KEYS.USER)) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utility: normalize image URL
  const normalizeImgUrl = (img) => {
    if (!img) return null;

    // If already a valid URL or base64
    if (img.startsWith('http') || img.startsWith('data:image')) return img;

    // If backend sends only a filename, prepend server URL
    return `https://yourserver.com/uploads/${img}`;
  };

  useEffect(() => {
    if (user?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      if (!user.remember) {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.removeItem(STORAGE_KEYS.USER);
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.USER);
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // Update profile image
  const updateProfileImage = (newImgUrl) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      img_url: normalizeImgUrl(newImgUrl),
    };

    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // Login
  const login = (data, remember = true) => {
    setLoading(true);
    setError(null);

    try {
      const backendRole = data.role || '';
      const normalizedRole = backendRole.toLowerCase().replace('-', '');

      const normalizedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        token: data.token,
        role: normalizedRole,
        isAdmin: normalizedRole === 'admin',
        isSubAdmin: normalizedRole === 'subadmin',
        isUser: normalizedRole === 'user' || !normalizedRole,
        img_url: normalizeImgUrl(data.img_url || null), // ✅ normalized
        remember,
      };

      setUser(normalizedUser);
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setError(null);
  };

  // Permission check
  const hasPermission = (requiredRole) => {
    if (!user) return false;

    const permissions = {
      admin: ['admin'],
      subadmin: ['admin', 'subadmin'],
      user: ['admin', 'subadmin', 'user'],
    };

    return permissions[requiredRole]?.includes(user.role) || false;
  };

  const value = {
    user,
    token: user?.token,
    login,
    logout,
    updateProfileImage,
    loading,
    error,
    isAdmin: user?.isAdmin || false,
    isSubAdmin: user?.isSubAdmin || false,
    isUser: user?.isUser || false,
    isAuthenticated: !!user,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for consuming AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};