interface User {
  id: string;
  email: string;
  name: string;
  registration_no: string;
  branch: string;
  year: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  downloads: number;
  url: string;
}

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const EVENTS_KEY = 'events';
const RESOURCES_KEY = 'resources';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const getUsers = (): StoredUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const createUser = (userData: Omit<StoredUser, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  
  // Check if email already exists
  if (users.some(user => user.email === userData.email)) {
    throw new Error('Email already registered');
  }

  // Check if registration number already exists
  if (users.some(user => user.registration_no === userData.registration_no)) {
    throw new Error('Registration number already exists');
  }

  const newUser: StoredUser = {
    ...userData,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const loginUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Store current user without password
  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

  return userWithoutPassword;
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const updateUser = (id: string, userData: Partial<User>): User => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[userIndex], ...userData };
  users[userIndex] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));

  const currentUser = getCurrentUser();
  if (currentUser?.id === id) {
    logoutUser();
  }
};

export const getEvents = (): Event[] => {
  const eventsJson = localStorage.getItem(EVENTS_KEY);
  return eventsJson ? JSON.parse(eventsJson) : [];
};

export const getResources = (): Resource[] => {
  const resourcesJson = localStorage.getItem(RESOURCES_KEY);
  return resourcesJson ? JSON.parse(resourcesJson) : [];
};
