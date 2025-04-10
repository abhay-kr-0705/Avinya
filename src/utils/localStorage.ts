import { User, Event } from '../types';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

// Auth Token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Clear all auth data
export const clearAuth = (): void => {
  removeAuthToken();
  removeUser();
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const setUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const updateUser = (userId: string, updates: Partial<User>) => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    setUsers(users);
  }
};

export const getEvents = (): Event[] => {
  const events = localStorage.getItem('events');
  return events ? JSON.parse(events) : [];
};

export const setEvents = (events: Event[]) => {
  localStorage.setItem('events', JSON.stringify(events));
};
