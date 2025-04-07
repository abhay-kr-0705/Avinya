import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { registerForEvent, getEventById, createPaymentOrder } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, User, DollarSign, Calendar, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import PaymentService from '../services/PaymentService';
import Layout from '../components/Layout';

// College list sorted alphabetically
const COLLEGE_LIST = [
  "Gaya College of Engineering, Gaya",
  "Darbhanga College of Engineering, Darbhanga",
  "Motihari College of Engineering, Motihari",
  "Muzaffarpur Institute of Technology, Muzaffarpur",
  "Bhagalpur College of Engineering, Bhagalpur",
  "Nalanda College of Engineering, Nalanda",
  "Loknayak Jai Prakash Institute of Technology, Saran",
  "Sitamarhi Institute of Technology, Sitamarhi",
  "Bakhtiyarpur College of Engineering, Patna",
  "Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai",
  "Katihar Engineering College, Katihar",
  "Shershah College of Engineering, Rohtas",
  "BP Mandal College of Engineering, Madhepura",
  "Saharsa College of Engineering, Saharsa",
  "Supaul College of Engineering, Supaul",
  "Purnea College of Engineering, Purnea",
  "Government Engineering College, Vaishali",
  "Government Engineering College, Banka",
  "Government Engineering College, Jamui",
  "Government Engineering College, Bhojpur",
  "Government Engineering College, Siwan",
  "Government Engineering College, Madhubani",
  "Government Engineering College, Arwal",
  "Government Engineering College, Aurangabad",
  "Government Engineering College, Jehanabad",
  "Government Engineering College, Khagaria",
  "Government Engineering College, Buxar",
  "Government Engineering College, Sheikhpura",
  "Government Engineering College, Lakhisarai",
  "Government Engineering College, Kishanganj",
  "Government Engineering College, Sheohar",
  "Government Engineering College, Kaimur",
  "Government Engineering College, Gopalganj",
  "Government Engineering College, Munger",
  "Government Engineering College, West Champaran",
  "Government Engineering College, Nawada",
  "Government Engineering College, Samastipur",
  "Shri Phanishwar Nath Renu Engineering College, Araria"
].sort();

interface RegistrationForm {
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  college: string;
  isGroupRegistration: boolean;
  teamName?: string;
  members?: {
    name: string;
    email: string;
    registration_no: string;
    mobile_no: string;
    semester: string;
    college: string;
  }[];
  memberCount?: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventType?: 'individual' | 'group';
  fee?: number;
  maxTeamSize?: number;
  date: string;
  end_date: string;
  venue: string;
}

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
}

const EventRegistration = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredColleges, setFilteredColleges] = useState(COLLEGE_LIST);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', email: '', phone: '', college: '' },
    { name: '', email: '', phone: '', college: '' }
  ]);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');

  const [form, setForm] = useState<RegistrationForm>({
    name: user?.name || '',
    email: user?.email || '',
    registration_no: user?.registration_no || '',
    mobile_no: user?.mobile || '',
    semester: user?.semester || '',
    college: '',
    isGroupRegistration: false,
    teamName: '',
    members: [],
    memberCount: 2
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${eventId}/register` } });
      return;
    }

    if (!eventId) {
      navigate('/events');
      return;
    }

    fetchEvent();
  }, [eventId, navigate, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredColleges(COLLEGE_LIST);
    } else {
      const filtered = COLLEGE_LIST.filter(college => 
        college.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [searchTerm]);

  const fetchEvent = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);
      
      // Initialize form with default group registration status based on event type
      if (eventData.eventType === 'group') {
        setForm(prev => ({
          ...prev,
          isGroupRegistration: true,
          members: [
            { name: '', email: '', registration_no: '', mobile_no: '', semester: '', college: '' },
            { name: '', email: '', registration_no: '', mobile_no: '', semester: '', college: '' }
          ]
        }));
      }
    } catch (error) {
      handleError(error, 'Failed to fetch event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !user) return;

    try {
      // Validate required fields
      if (event.eventType === 'group') {
        if (!teamName.trim()) {
          toast.error('Please enter a team name');
          return;
        }
        
        // Validate at least 2 team members
        const validMembers = teamMembers.filter(member => 
          member.name.trim() && member.email.trim() && member.phone.trim() && member.college.trim()
        );
        
        if (validMembers.length < 2) {
          toast.error('At least 2 team members are required');
          return;
        }
      }

      // Prepare registration data
      const registrationData = {
        name: user.name,
        email: user.email,
        registration_no: user.registration_no || '',
        mobile_no: user.mobile || '',
        semester: user.semester || '',
        college: user.college || '',
        teamName: event.eventType === 'group' ? teamName : undefined,
        members: event.eventType === 'group' ? teamMembers.map(member => ({
          name: member.name,
          email: member.email,
          registration_no: '',
          mobile_no: member.phone,
          semester: '',
          college: member.college
        })) : undefined
      };

      // Register for the event
      await registerForEvent(event.id, registrationData);
      
      // Show success message
      toast.success('Registration successful!');
      
      // Redirect to payment page if it's a paid event
      if (event.fee && event.fee > 0) {
        navigate(`/payment/${event.id}`);
      } else {
        navigate('/events');
      }
    } catch (err) {
      handleError(err);
      toast.error('Failed to register for the event');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCollegeSelect = (college: string) => {
    setForm(prev => ({ ...prev, college }));
    setSearchTerm(college);
    setDropdownOpen(false);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    setForm(prev => {
      const updatedMembers = [...(prev.members || [])];
      if (!updatedMembers[index]) {
        updatedMembers[index] = { name: '', email: '', registration_no: '', mobile_no: '', semester: '', college: '' };
      }
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, members: updatedMembers };
    });
  };

  const handleMemberCollegeSelect = (index: number, college: string) => {
    handleMemberChange(index, 'college', college);
    setDropdownOpen(false);
  };

  const getTotalFee = () => {
    if (!event?.fee) return 0;
    
    if (form.isGroupRegistration && form.members) {
      return event.fee * (form.members.length + 1); // including the team leader
    } else {
      return event.fee;
    }
  };

  const addMember = () => {
    if (!form.members || form.members.length >= (event?.maxTeamSize || 5) - 1) {
      // -1 because the team leader is not in the members array
      return;
    }
    
    setForm(prev => ({
      ...prev,
      members: [...(prev.members || []), { 
        name: '', 
        email: '', 
        registration_no: '', 
        mobile_no: '', 
        semester: '', 
        college: '' 
      }]
    }));
  };

  const removeMember = (index: number) => {
    if (!form.members || form.members.length <= 1) return;
    
    setForm(prev => ({
      ...prev,
      members: prev.members?.filter((_, i) => i !== index)
    }));
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newTeamMembers = [...teamMembers];
    newTeamMembers[index] = {
      ...newTeamMembers[index],
      [field]: value
    };
    setTeamMembers(newTeamMembers);
  };

  const addTeamMember = () => {
    if (teamMembers.length < (event?.maxTeamSize || 10)) {
      setTeamMembers([...teamMembers, { name: '', email: '', phone: '', college: '' }]);
    }
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 2) {
      const newTeamMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(newTeamMembers);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold mt-4">Event Not Found</h2>
            </div>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/events')} 
              className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Register for {event.title}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {event.eventType === 'group' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <h2 className="text-xl font-semibold">Team Members</h2>
              {teamMembers.map((member, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <h3 className="font-medium">Member {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">College</label>
                      <input
                        type="text"
                        value={member.college}
                        onChange={(e) => handleTeamMemberChange(index, 'college', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  {index >= 2 && (
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove Member
                    </button>
                  )}
                </div>
              ))}
              
              {teamMembers.length < (event.maxTeamSize || 10) && (
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Add Team Member
                </button>
              )}
            </div>
          )}

          {event.fee && event.fee > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800">
                This event requires a registration fee of ₹{event.fee}. 
                You will be redirected to the payment page after registration.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EventRegistration;