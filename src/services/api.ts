import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request [${config.method?.toUpperCase()}] ${config.url}:`, config.data || '');
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
    
    // Special handling for 413 Request Entity Too Large
    if (axiosError.response?.status === 413) {
      toast.error('Upload failed: Image size is too large. Please use a smaller image or compress it further.');
      console.error('API Error: Request entity too large. File size exceeded server limit.');
      return;
    }
    
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
  mobile: string,
  college?: string
) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      registration_no,
      branch,
      semester,
      mobile,
      college
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

// Change password
const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    if (response.data.success) {
      toast.success('Password changed successfully');
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || 'Failed to change password';
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
    const response = await api.put('/auth/update-profile', userData);
    if (response.data.success) {
      toast.success('Profile updated successfully');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Extended Event interface with new fields
interface EventData {
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  type: 'upcoming' | 'past' | string;
  eventType: 'individual' | 'group';
  fee: number;
  maxTeamSize?: number;
  thumbnail: string;
}

// Add a utility function to properly normalize event data
export const normalizeEvent = (event: any): any => {
  if (!event) {
    console.error('Received null or undefined event to normalize');
    return null;
  }
  
  const eventId = event.id || event._id || 'unknown';
  console.log(`Normalizing event: ${eventId}`);
  
  const normalizedEvent = {
    id: event.id || event._id,
    title: event.title || 'Untitled Event',
    description: event.description || '',
    date: event.date || new Date().toISOString(),
    end_date: event.end_date || event.date || new Date().toISOString(),
    venue: event.venue || 'TBD',
    type: event.type || 'upcoming',
    eventType: event.eventType || 'individual',
    fee: typeof event.fee === 'number' ? event.fee : 0,
    maxTeamSize: event.eventType === 'group' && event.maxTeamSize ? 
                Number(event.maxTeamSize) : undefined,
    thumbnail: event.thumbnail || ''
  };
  
  return normalizedEvent;
};

// Event APIs
const createEvent = async (eventData: EventData) => {
  try {
    console.log('Creating event with raw data:', JSON.stringify(eventData));
    
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date || 
        !eventData.venue || !eventData.eventType || !eventData.thumbnail) {
      throw new Error('Missing required fields');
    }
    
    // Validate event type
    if (!['individual', 'group'].includes(eventData.eventType)) {
      throw new Error('Invalid event type');
    }
    
    // Validate fee
    if (typeof eventData.fee !== 'number' || eventData.fee < 0) {
      throw new Error('Invalid fee amount');
    }
    
    // Validate maxTeamSize for group events
    if (eventData.eventType === 'group') {
      if (!eventData.maxTeamSize || eventData.maxTeamSize < 2 || eventData.maxTeamSize > 10) {
        throw new Error('Invalid team size for group event');
      }
    }
    
    // Validate thumbnail
    if (!eventData.thumbnail.startsWith('http://') && 
        !eventData.thumbnail.startsWith('https://') && 
        !eventData.thumbnail.startsWith('data:image/')) {
      throw new Error('Invalid thumbnail format');
    }
    
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

// Modify the getEvents function to normalize all events
const getEvents = async () => {
  try {
    const response = await api.get('/events');
    console.log('Raw events data from API:', response.data);
    
    // Ensure we have an array
    if (!Array.isArray(response.data)) {
      console.error('API did not return an array for events:', response.data);
      return [];
    }
    
    // Normalize all events to ensure consistent data structure
    return response.data.map(normalizeEvent);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateEvent = async (id: string, eventData: Partial<EventData>) => {
  try {
    console.log(`Updating event ${id} with raw data:`, JSON.stringify(eventData));
    
    // Pre-normalize the data before sending to server
    const processedData = {
      ...eventData,
      
      // Ensure fee is a number if provided
      ...(eventData.fee !== undefined && {
        fee: (function() {
          if (typeof eventData.fee === 'number' && !isNaN(eventData.fee)) {
            return eventData.fee;
          } else if (typeof eventData.fee === 'string' && eventData.fee !== '') {
            const parsedFee = parseFloat(String(eventData.fee).trim());
            return !isNaN(parsedFee) ? parsedFee : 0;
          }
          return 0; // Default for any other case
        })()
      }),
      
      // Ensure eventType is valid if provided
      ...(eventData.eventType !== undefined && {
        eventType: (function() {
          if (eventData.eventType === 'group' || eventData.eventType === 'individual') {
            return eventData.eventType;
          }
          // Try to infer from string value if possible
          if (typeof eventData.eventType === 'string') {
            const typeStr = String(eventData.eventType).toLowerCase().trim();
            if (typeStr === 'group' || typeStr === 'team') {
              return 'group';
            }
          }
          return 'individual'; // Default value
        })()
      }),
      
      // Validate thumbnail if present
      ...(eventData.thumbnail !== undefined && {
        thumbnail: (function() {
          if (!eventData.thumbnail) return '';
          
          if (typeof eventData.thumbnail === 'string') {
            const trimmedUrl = String(eventData.thumbnail).trim();
            if (trimmedUrl.startsWith('http://') || 
                trimmedUrl.startsWith('https://') || 
                trimmedUrl.startsWith('data:image/')) {
              return trimmedUrl;
            }
          }
          return '';
        })()
      })
    };
    
    // Debug log what's being sent to API
    console.log('Processed update data for API:', {
      ...processedData,
      fee: processedData.fee,
      eventType: processedData.eventType,
      thumbnail: processedData.thumbnail ? 'Thumbnail data present' : 'No thumbnail'
    });
    
    const response = await api.put(`/events/${id}`, processedData);
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

const createGallery = async (galleryData: FormData) => {
  try {
    const response = await api.post('/gallery', galleryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

const deleteGallery = async (galleryId: string) => {
  try {
    const response = await api.delete(`/gallery/${galleryId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Gallery management
const updateGalleryPhotos = async (galleryId: string, photos: FormData) => {
  try {
    const response = await api.put(`/gallery/${galleryId}/photos`, photos, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const removeGalleryPhoto = async (galleryId: string, photoId: string) => {
  try {
    const response = await api.delete(`/gallery/${galleryId}/photos/${photoId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateGalleryThumbnail = async (galleryId: string, thumbnail: FormData) => {
  try {
    const response = await api.put(`/gallery/${galleryId}/thumbnail`, thumbnail, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
interface ResourceData {
  title: string;
  description: string;
  url: string;
  type: string;
  domain?: string;
}

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

const createResource = async (data: ResourceData) => {
  try {
    const response = await api.post('/resources', data);
    if (response.data.success) {
      toast.success('Resource created successfully');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateResource = async (id: string, data: ResourceData) => {
  try {
    const response = await api.put(`/resources/${id}`, data);
    if (response.data.success) {
      toast.success('Resource updated successfully');
    }
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

export interface Participant {
  id: string;
  name: string;
  type: 'individual' | 'team';
  college: string;
  scores: {
    eventId: string;
    eventName: string;
    category: string;
    score: number;
  }[];
  teamMembers?: string[];
  totalScore?: number;
  rank?: number;
}

// Rename the old function to avoid duplications
const getParticipantsLeaderboard = async (): Promise<Participant[]> => {
  try {
    // This would normally be replaced with an actual API call
    // For now, returning mock data
    return [
      {
        id: "1",
        name: "Team Innovators",
        type: "team",
        college: "IIT Bombay",
        scores: [
          { eventId: "e1", eventName: "Hackathon 2023", category: "Hackathon", score: 95 },
          { eventId: "e2", eventName: "Tech Quiz", category: "Quiz", score: 85 }
        ],
        teamMembers: ["Rahul Shah", "Priya Patel", "Arjun Singh"]
      },
      {
        id: "2",
        name: "Amit Kumar",
        type: "individual",
        college: "IIT Delhi",
        scores: [
          { eventId: "e2", eventName: "Tech Quiz", category: "Quiz", score: 92 },
          { eventId: "e3", eventName: "Coding Challenge", category: "Coding", score: 88 }
        ]
      },
      {
        id: "3",
        name: "Team CodeWarriors",
        type: "team",
        college: "BITS Pilani",
        scores: [
          { eventId: "e1", eventName: "Hackathon 2023", category: "Hackathon", score: 90 },
          { eventId: "e3", eventName: "Coding Challenge", category: "Coding", score: 85 },
          { eventId: "e4", eventName: "UI/UX Challenge", category: "Design", score: 80 }
        ],
        teamMembers: ["Vikram Sharma", "Neha Gupta", "Karthik Reddy", "Ananya Desai"]
      },
      {
        id: "4",
        name: "Sneha Verma",
        type: "individual",
        college: "NIT Trichy",
        scores: [
          { eventId: "e5", eventName: "Robotics Workshop", category: "Robotics", score: 95 },
          { eventId: "e6", eventName: "ML Bootcamp", category: "Machine Learning", score: 90 }
        ]
      },
      {
        id: "5",
        name: "Team TechNinjas",
        type: "team",
        college: "MIT Manipal",
        scores: [
          { eventId: "e7", eventName: "Cyber Security Challenge", category: "Cybersecurity", score: 88 },
          { eventId: "e8", eventName: "App Development Contest", category: "App Development", score: 92 }
        ],
        teamMembers: ["Rohan Menon", "Sarika Shah", "Tarun Nair"]
      },
      {
        id: "6",
        name: "Aditya Patel",
        type: "individual",
        college: "VIT Vellore",
        scores: [
          { eventId: "e6", eventName: "ML Bootcamp", category: "Machine Learning", score: 85 },
          { eventId: "e9", eventName: "Web Development Hackathon", category: "Web Development", score: 95 }
        ]
      },
      {
        id: "7",
        name: "Team BrainWave",
        type: "team",
        college: "SRM University",
        scores: [
          { eventId: "e10", eventName: "IoT Challenge", category: "Robotics", score: 78 },
          { eventId: "e11", eventName: "Tech Fest Quiz", category: "Quiz", score: 88 }
        ],
        teamMembers: ["Kavitha Rajan", "Suresh Kumar", "Deepak Menon"]
      },
      {
        id: "8",
        name: "Ravi Sharma",
        type: "individual",
        college: "IIIT Hyderabad",
        scores: [
          { eventId: "e3", eventName: "Coding Challenge", category: "Coding", score: 95 },
          { eventId: "e12", eventName: "Algorithm Marathon", category: "Coding", score: 90 }
        ]
      },
      {
        id: "9",
        name: "Team ByteBusters",
        type: "team",
        college: "IIT Madras",
        scores: [
          { eventId: "e1", eventName: "Hackathon 2023", category: "Hackathon", score: 92 },
          { eventId: "e9", eventName: "Web Development Hackathon", category: "Web Development", score: 88 }
        ],
        teamMembers: ["Siddharth Nair", "Anjali Menon", "Karan Patel"]
      },
      {
        id: "10",
        name: "Divya Gupta",
        type: "individual",
        college: "NSIT Delhi",
        scores: [
          { eventId: "e2", eventName: "Tech Quiz", category: "Quiz", score: 85 },
          { eventId: "e7", eventName: "Cyber Security Challenge", category: "Cybersecurity", score: 92 }
        ]
      }
    ];
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Modify getEventById to normalize the event
const getEventById = async (id: string) => {
  try {
    console.log(`Fetching event with id: ${id}`);
    const response = await api.get(`/events/${id}`);
    console.log('Raw event data from API:', response.data);
    
    if (!response.data) {
      console.error('API returned empty data for event:', id);
      return null;
    }
    
    return normalizeEvent(response.data);
  } catch (error) {
    handleApiError(error);
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
};

// Leaderboard Admin Functions
const updateParticipantScore = async (
  participantId: string, 
  scoreData: {
    eventId: string;
    eventName: string;
    category: string;
    score: number;
  }
) => {
  try {
    const response = await api.post(`/leaderboard/${participantId}/scores`, scoreData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const createParticipant = async (participantData: {
  name: string;
  type: 'individual' | 'team';
  college: string;
  teamMembers?: string[];
}) => {
  try {
    const response = await api.post('/leaderboard/participants', participantData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const deleteParticipant = async (participantId: string) => {
  try {
    const response = await api.delete(`/leaderboard/participants/${participantId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Leaderboard Management
export interface LeaderboardParticipant {
  id: string;
  name: string;
  team?: string;
  college: string;
  score: number;
  avatar?: string;
  event?: string;
  performance?: Array<{
    round: string;
    score: number;
  }>;
}

const getLeaderboardParticipants = async (): Promise<LeaderboardParticipant[]> => {
  try {
    const response = await api.get('/leaderboard');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching leaderboard participants:', error);
    toast.error('Failed to fetch leaderboard data');
    throw error;
  }
};

const getLeaderboardParticipant = async (id: string): Promise<LeaderboardParticipant> => {
  try {
    const response = await api.get(`/leaderboard/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leaderboard participant:', error);
    toast.error('Failed to fetch participant details');
    throw error;
  }
};

const addLeaderboardParticipant = async (participantData: Omit<LeaderboardParticipant, 'id'>): Promise<LeaderboardParticipant> => {
  try {
    const response = await api.post('/leaderboard', participantData);
    toast.success('Participant added successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error adding leaderboard participant:', error);
    toast.error('Failed to add participant');
    throw error;
  }
};

const updateLeaderboardParticipant = async (id: string, participantData: Partial<LeaderboardParticipant>): Promise<LeaderboardParticipant> => {
  try {
    const response = await api.put(`/leaderboard/${id}`, participantData);
    toast.success('Participant updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error updating leaderboard participant:', error);
    toast.error('Failed to update participant');
    throw error;
  }
};

const deleteLeaderboardParticipant = async (id: string): Promise<void> => {
  try {
    await api.delete(`/leaderboard/${id}`);
    toast.success('Participant removed successfully');
  } catch (error) {
    console.error('Error deleting leaderboard participant:', error);
    toast.error('Failed to remove participant');
    throw error;
  }
};

// Payment-related API functions
const createPaymentOrder = async (
  eventId: string, 
  registrationId: string, 
  amount: number
) => {
  try {
    const response = await api.post('/payments/create-order', {
      eventId, 
      registrationId, 
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    toast.error('Failed to create payment order');
    throw error;
  }
};

const updatePaymentStatus = async (
  eventId: string,
  registrationId: string,
  status: 'pending' | 'completed',
  paymentDetails?: any
) => {
  try {
    const response = await api.post('/payments/update-status', {
      eventId, 
      registrationId, 
      status,
      paymentDetails
    });
    toast.success('Payment status updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    toast.error('Failed to update payment status');
    throw error;
  }
};

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email?: string;
  college: string;
  eventName: string;
  category: string;
  position: string;
  points: number;
  year?: string;
  thumbnail?: string;
}

const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await api.get('/leaderboard');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const addLeaderboardEntry = async (entryData: Omit<LeaderboardEntry, 'id'>) => {
  try {
    const response = await api.post('/leaderboard', entryData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const updateLeaderboardEntry = async (id: string, entryData: Partial<LeaderboardEntry>) => {
  try {
    const response = await api.put(`/leaderboard/${id}`, entryData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const deleteLeaderboardEntry = async (id: string) => {
  try {
    const response = await api.delete(`/leaderboard/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Export all functions
export {
  login,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
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
  updateGalleryPhotos,
  removeGalleryPhoto,
  updateGalleryThumbnail,
  uploadImage,
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getParticipantsLeaderboard as getLeaderboard, // Use the new implementation but export with the original name
  getEventById,
  updateParticipantScore,
  createParticipant,
  deleteParticipant,
  getLeaderboardParticipants,
  getLeaderboardParticipant,
  addLeaderboardParticipant,
  updateLeaderboardParticipant,
  deleteLeaderboardParticipant,
  createPaymentOrder,
  updatePaymentStatus,
  addLeaderboardEntry,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
};

export default api;
