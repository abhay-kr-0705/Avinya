import api from './api';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  registration_no: string;
  branch: string;
  semester: string;
  mobile: string;
  created_at: string;
  last_login?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  type: 'upcoming' | 'past';
  registrations: Array<{
    user: User;
    registered_at: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }>;
  registrationCount: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// User Management
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<ApiResponse<User>> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/role`, { role });
    toast.success('User role updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    throw error;
  }
};

// Event Management
export const getAllEventsWithRegistrations = async (): Promise<ApiResponse<Event[]>> => {
  try {
    const response = await api.get<ApiResponse<Event[]>>('/admin/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    toast.error('Failed to fetch events');
    throw error;
  }
};

export const getEventRegistrations = async (eventId: string): Promise<ApiResponse<Event['registrations']>> => {
  try {
    const response = await api.get<ApiResponse<Event['registrations']>>(`/admin/events/${eventId}/registrations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    toast.error('Failed to fetch event registrations');
    throw error;
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
  try {
    const response = await api.post<ApiResponse<Event>>('/admin/events', eventData);
    toast.success('Event created successfully');
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event');
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
  try {
    const response = await api.put<ApiResponse<Event>>(`/admin/events/${eventId}`, eventData);
    toast.success('Event updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    toast.error('Failed to update event');
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/admin/events/${eventId}`);
    toast.success('Event deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    toast.error('Failed to delete event');
    throw error;
  }
};
