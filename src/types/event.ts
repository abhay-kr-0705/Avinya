export interface TeamMember {
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  isLeader: boolean;
  status: 'registered' | 'attended' | 'cancelled';
}

export interface Registration {
  _id: string;
  event: {
    _id: string;
    title: string;
    fee: number;
  };
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  teamName: string | null;
  isLeader: boolean;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  [key: string]: any; // Allow indexing for search
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  eventType: 'individual' | 'group';
  fee: number;
  maxTeamSize?: number;
  thumbnail: string;
  type: string;
}

export interface GroupRegistration {
  teamName: string;
  members: Registration[];
  totalFee: number;
}

export interface RegistrationsData {
  individuals?: Registration[];
  [key: string]: GroupRegistration | Registration[] | undefined;
}

export interface ExportData {
  'Registration Type': string;
  'Team Name'?: string;
  'Name': string;
  'Email': string;
  'Registration No': string;
  'Mobile No': string;
  'Semester': string;
  'Role'?: string;
  'Status': string;
  'Registration Date': string;
  'Fee Paid': number;
} 