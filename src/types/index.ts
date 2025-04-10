export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  name: string;
  registration_no: string;
  branch: string;
  year: number;
  mobile: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser extends User {
  role: 'admin' | 'superadmin';
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  email: string;
  registration_no: string;
  phone: string;
  created_at: string;
  ticket_sent: boolean;
}

export interface EventDetails {
  agenda?: string[];
  prerequisites?: string[];
  requirements?: string[];
  benefits?: string[];
  speakers?: {
    name: string;
    bio: string;
    image?: string;
  }[];
  id: string;
  full_description: string;
  winners: Array<{
    position: string;
    name: string;
    project: string;
  }>;
  gallery: Array<{
    url: string;
    caption: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  date: string;
  venue: string;
  max_participants?: number;
  registration_deadline?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  details?: EventDetails;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  photos: Photo[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Photo {
  id: string;
  gallery_id: string;
  url: string;
  caption?: string;
  order: number;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'document' | 'video' | 'link';
  created_at: string;
  updated_at: string;
  created_by: string;
}