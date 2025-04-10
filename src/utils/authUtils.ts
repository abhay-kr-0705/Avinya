import { login, register, getCurrentUser } from '../services/api';
import { setAuthToken, setUser, getAuthToken, clearAuth } from './localStorage';
import { handleError } from './errorHandling';

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const { data } = await login(email, password);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  } catch (error) {
    handleError(error, 'Login failed');
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, name: string) => {
  try {
    const { data } = await register(email, password, name);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  } catch (error) {
    handleError(error, 'Registration failed');
    throw error;
  }
};

export const checkAuthStatus = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const user = await getCurrentUser();
    setUser(user);
    return user;
  } catch (error) {
    clearAuth();
    return null;
  }
};