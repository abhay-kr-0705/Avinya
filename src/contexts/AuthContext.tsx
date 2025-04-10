import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '../services/api';
import { getAuthToken, setAuthToken, clearAuth, setUser as setLocalUser, getUser as getLocalUser } from '../utils/localStorage';
import { handleError } from '../utils/errorHandling';
import { toast } from 'react-toastify'; // Assuming you have react-toastify installed

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  registration_no?: string;
  mobile?: string;
  semester?: string;
  branch?: string;
  college?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, registration_no: string, branch: string, semester: string, mobile: string, college?: string) => Promise<void>;
  signOut: () => Promise<{ success: boolean }>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(getLocalUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const userData = await getCurrentUser();
          setUserState(userData);
          setLocalUser(userData);
        }
      } catch (error) {
        handleError(error, 'Session expired');
        clearAuth();
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      if (response.success && response.token && response.user) {
        setAuthToken(response.token);
        setUserState(response.user);
        setLocalUser(response.user);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      handleError(error, 'Login failed');
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, name: string, registration_no: string, branch: string, semester: string, mobile: string, college?: string) => {
    try {
      const { data } = await apiRegister(email, password, name, registration_no, branch, semester, mobile, college);
      toast.success('Registration successful! Please login.');
    } catch (error) {
      handleError(error, 'Registration failed');
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await apiLogout();
      clearAuth();
      setUserState(null);
      return { success: true };
    } catch (error) {
      // Even if there's an error, we want to clear the local state
      clearAuth();
      setUserState(null);
      console.warn('Sign out encountered an error, but local state was cleared:', error);
      return { success: true };
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUserData = await response.json();
      setUserState(updatedUserData);
      setLocalUser(updatedUserData);
      
      // Refresh user data from server
      const refreshedUser = await getCurrentUser();
      setUserState(refreshedUser);
      setLocalUser(refreshedUser);
    } catch (error) {
      handleError(error, 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;