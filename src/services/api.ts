import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = 'https://genx-backend-rdzx.onrender.com/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const errorMessage = axiosError.response?.data?.message || axiosError.message;
    toast.error(errorMessage);
    console.error('API Error:', errorMessage);
  } else {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred');
  }
};

// Auth functions
const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const register = async (
  email: string,
  password: string,
  name: string,
  registration_no: string,
  branch: string,
  semester: string,
  mobile: string
) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      registration_no,
      branch,
      semester,
      mobile
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const resetPassword = async (token: string, password: string) => {
  try {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// User Profile
const updateProfile = async (userData: {
  name?: string;
  registration_no?: string;
  branch?: string;
  semester?: string;
  mobile?: string;
  role?: string;
}) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Event APIs
const createEvent = async (eventData: {
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  type: 'upcoming' | 'past';
}) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const registerForEvent = async (
  eventId: string,
  registrationData: {
    name: string;
    email: string;
    registration_no: string;
    mobile_no: string;
    semester: string;
  }
) => {
  try {
    const response = await api.post(`/events/${eventId}/register`, registrationData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getUserRegistrations = async (email: string) => {
  try {
    const response = await api.get('/events/registrations', {
      params: { email }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateEvent = async (
  id: string,
  eventData: {
    title?: string;
    description?: string;
    date?: string;
    end_date?: string;
    venue?: string;
    type?: 'upcoming' | 'past';
  }
) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const deleteEvent = async (id: string) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getEventRegistrations = async (eventId: string) => {
  try {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Gallery
const getGalleries = async () => {
  try {
    const response = await api.get('/gallery');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getGallery = async (id: string) => {
  try {
    const response = await api.get(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getGalleryPhotos = async () => {
  try {
    const response = await api.get('/gallery/photos');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const createGallery = async (galleryData: any) => {
  try {
    const response = await api.post('/gallery', galleryData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateGallery = async (id: string, galleryData: any) => {
  try {
    const response = await api.put(`/gallery/${id}`, galleryData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const deleteGallery = async (id: string) => {
  try {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Image upload
const uploadImage = async (formData: FormData) => {
  try {
    const response = await api.post('/gallery/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Resources
const getResources = async () => {
  try {
    const response = await api.get('/resources');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getResource = async (id: string) => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const createResource = async (resourceData: any) => {
  try {
    const response = await api.post('/resources', resourceData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateResource = async (id: string, resourceData: any) => {
  try {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const deleteResource = async (id: string) => {
  try {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export {
  login,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  createEvent,
  registerForEvent,
  getUserRegistrations,
  getEvents,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  getGalleries,
  getGallery,
  getGalleryPhotos,
  createGallery,
  updateGallery,
  deleteGallery,
  uploadImage,
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
};

export default api;
