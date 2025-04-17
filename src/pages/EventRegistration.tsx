import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { registerForEvent, getEventById, createPaymentOrder } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, User, DollarSign, Calendar, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import PaymentService from '../services/PaymentService';

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
    
    try {
      setSubmitting(true);
      
      // Prepare data for API - convert to format expected by backend
      const registrationData = {
        name: form.name,
        email: form.email,
        registration_no: form.registration_no,
        mobile_no: form.mobile_no,
        semester: form.semester,
        college: form.college,
      };
      
      if (form.isGroupRegistration && event?.eventType === 'group') {
        // For group registrations, we'll need to include team information
        Object.assign(registrationData, {
          teamName: form.teamName,
          members: form.members,
        });
      }
      
      if (!eventId) {
        throw new Error('Event ID is missing');
      }
      
      // Register for the event
      const response = await registerForEvent(eventId, registrationData);
      
      // If the event has a fee, initiate payment
      if (event?.fee && event.fee > 0) {
        try {
          // Create a payment order and get order ID
          const totalFee = getTotalFee();
          const orderData = await createPaymentOrder(
            eventId, 
            response.registration.id, 
            totalFee
          );
          
          // Initialize Razorpay payment
          const paymentInitiated = await PaymentService.initiatePayment({
            amount: totalFee,
            name: event.title,
            description: `Registration for ${event.title}`,
            orderId: orderData.id,
            eventId: eventId,
            registrationId: response.registration.id,
            email: form.email,
            contact: form.mobile_no,
            redirect: true, // Redirect to registration page after payment
            notes: {
              eventType: event.eventType || 'individual',
              teamName: form.teamName || '',
            }
          });
          
          if (!paymentInitiated) {
            // If payment couldn't be initiated, still redirect to events page
            navigate('/events');
          }
          // The redirect happens in PaymentService if successful
        } catch (paymentError) {
          console.error('Payment initialization failed:', paymentError);
          toast.error('Payment could not be initiated. You can complete payment later from your registrations page.');
          navigate('/my-registrations');
        }
      } else {
        // If no payment needed, just navigate to events page
        navigate('/events');
        toast.success('Registration successful!');
      }
    } catch (error) {
      handleError(error, 'Failed to register for event');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-16">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 border-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        ) : event ? (
          <>
            {/* Event Details Card */}
            <div className="glass-card shadow-lg mb-8 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center px-4 z-10">
                  Registration for {event.title}
                </h1>
              </div>
              
              <div className="p-6 md:p-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Event Date</p>
                      <p className="text-gray-700">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Venue</p>
                      <p className="text-gray-700">{event.venue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {event.eventType === 'group' ? (
                      <Users className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" />
                    ) : (
                      <User className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Event Type</p>
                      <p className="text-gray-700">
                        {event.eventType === 'group' ? 'Group Event' : 'Individual Event'}
                        {event.eventType === 'group' && event.maxTeamSize && (
                          <span className="ml-1 text-sm text-gray-500">
                            (Max {event.maxTeamSize} members)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                {event.fee !== undefined && (
                  <div className="flex items-center mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <DollarSign className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium">Registration Fee</p>
                      <p className="text-amber-700">
                        {event.fee > 0 ? (
                          <>
                            ₹{event.fee} {event.eventType === 'group' ? 'per team' : 'per participant'}
                            {form.isGroupRegistration && (
                              <span className="ml-2 font-medium">
                                (Total: ₹{getTotalFee()})
                              </span>
                            )}
                          </>
                        ) : (
                          'Free Event'
                        )}
                      </p>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-700 mb-6">{event.description}</p>
              </div>
            </div>

            {/* Registration Form Card */}
            <div className="glass-card bg-white shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Registration Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                    <input
                      type="text"
                      name="registration_no"
                      value={form.registration_no}
                      onChange={handleChange}
                      placeholder="College Registration Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      name="mobile_no"
                      value={form.mobile_no}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                    <select
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select your semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                      <option value="3">3rd Semester</option>
                      <option value="4">4th Semester</option>
                      <option value="5">5th Semester</option>
                      <option value="6">6th Semester</option>
                      <option value="7">7th Semester</option>
                      <option value="8">8th Semester</option>
                    </select>
                  </div>
                  
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College *</label>
                    <div className="flex items-center relative">
                      <input
                        type="text"
                        name="college"
                        value={form.college}
                        onChange={handleChange}
                        onFocus={() => setDropdownOpen(true)}
                        placeholder="Search for your college"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                      <Search className="absolute right-3 h-5 w-5 text-gray-400" />
                    </div>
                    
                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
                        <input
                          type="text"
                          placeholder="Search colleges..."
                          className="w-full px-4 py-2 border-b border-gray-200"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        {filteredColleges.length === 0 ? (
                          <div className="p-4 text-gray-500 text-center">No colleges found</div>
                        ) : (
                          <ul className="py-2">
                            {filteredColleges.map((college, index) => (
                              <li
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleCollegeSelect(college)}
                              >
                                {college}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Group registration section */}
                {event.eventType === 'group' && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-800">Team Details</h3>
                      
                      <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700 mr-3">Number of Members:</label>
                        <select
                          name="memberCount"
                          value={form.memberCount}
                          onChange={handleChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                          {Array.from({ length: (event.maxTeamSize || 5) - 1 }, (_, i) => i + 2).map(count => (
                            <option key={count} value={count}>{count}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                      <input
                        type="text"
                        name="teamName"
                        value={form.teamName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <h4 className="text-md font-medium text-gray-700 mb-4">Team Members</h4>
                    
                    {form.members?.map((member, index) => (
                      <div key={index} className="mb-8 p-5 border border-gray-200 rounded-lg bg-white">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-medium text-gray-800">Member {index + 1}</h5>
                          
                          {index > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                            <input
                              type="text"
                              value={member.registration_no}
                              onChange={(e) => handleMemberChange(index, 'registration_no', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                            <input
                              type="tel"
                              value={member.mobile_no}
                              onChange={(e) => handleMemberChange(index, 'mobile_no', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                            <select
                              value={member.semester}
                              onChange={(e) => handleMemberChange(index, 'semester', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                              required
                            >
                              <option value="">Select semester</option>
                              <option value="1">1st Semester</option>
                              <option value="2">2nd Semester</option>
                              <option value="3">3rd Semester</option>
                              <option value="4">4th Semester</option>
                              <option value="5">5th Semester</option>
                              <option value="6">6th Semester</option>
                              <option value="7">7th Semester</option>
                              <option value="8">8th Semester</option>
                            </select>
                          </div>
                          
                          <div className="relative" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">College *</label>
                            <div className="flex items-center relative">
                              <input
                                type="text"
                                value={member.college}
                                onChange={(e) => handleMemberChange(index, 'college', e.target.value)}
                                placeholder="Search for college"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                required
                              />
                              <Search className="absolute right-3 h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {form.members && form.members.length < (event.maxTeamSize || 5) && (
                      <button
                        type="button"
                        onClick={addMember}
                        className="mt-4 w-full py-2 px-4 border border-primary-300 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                      >
                        + Add Team Member
                      </button>
                    )}
                  </div>
                )}
                
                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/events')}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : event.fee && event.fee > 0 ? (
                      'Register & Pay'
                    ) : (
                      'Register Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
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
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EventRegistration;