import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventRegistrations } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import { 
  Users, User, Calendar, MapPin, Download, ChevronDown, ChevronUp, 
  Mail, Phone, School, BookOpen, UserCheck, Search, DollarSign, X, Eye, Edit 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV, ExportData } from '../../utils/exportToCSV';
import type { Event, Registration, GroupRegistration, RegistrationsData } from '../../types/event';

interface TeamMember {
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  isLeader: boolean;
  status: 'registered' | 'attended' | 'cancelled';
}

const searchableFields: (keyof Registration)[] = [
  'name',
  'email',
  'registration_no',
  'mobile_no',
  'semester',
  'status'
];

const EventRegistrations: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationsData>({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      navigate('/admin/events');
      return;
    }
    fetchEventAndRegistrations();
  }, [eventId, navigate]);

  const fetchEventAndRegistrations = async () => {
    if (!eventId) return;

    try {
      const [eventResponse, registrationsResponse] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/register/event/${eventId}`)
      ]);

      if (!eventResponse.ok || !registrationsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const eventData = await eventResponse.json();
      const registrationsData = await registrationsResponse.json();

      // Transform event data to match Event interface
      const transformedEventData: Event = {
        _id: eventData._id,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        end_date: eventData.end_date,
        venue: eventData.venue,
        eventType: eventData.eventType,
        fee: eventData.fee,
        maxTeamSize: eventData.maxTeamSize,
        thumbnail: eventData.thumbnail,
        type: eventData.type
      };

      setEvent(transformedEventData);
      setRegistrations(registrationsData);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const toggleExpandRow = (registrationId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [registrationId]: !prev[registrationId]
    }));
  };

  const updateRegistrationStatus = async (registrationId: string, status: 'confirmed' | 'rejected') => {
    try {
      // Implement API call to update status
      // const response = await updateRegistrationStatus(eventId as string, registrationId, status);
      
      // Update local state
      setRegistrations(prevRegs => 
        prevRegs.map(reg => 
          reg.id === registrationId ? { ...reg, status } : reg
        )
      );
      
      toast.success(`Registration ${status === 'confirmed' ? 'confirmed' : 'rejected'} successfully`);
    } catch (error) {
      handleError(error, 'Failed to update registration status');
    }
  };

  const updatePaymentStatus = async (registrationId: string, status: 'completed' | 'pending') => {
    try {
      // Implement API call to update payment status
      // const response = await updatePaymentStatus(eventId as string, registrationId, status);
      
      // Update local state
      setRegistrations(prevRegs => 
        prevRegs.map(reg => 
          reg.id === registrationId ? { ...reg, payment_status: status } : reg
        )
      );
      
      toast.success(`Payment marked as ${status}`);
    } catch (error) {
      handleError(error, 'Failed to update payment status');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    if (!event) return;

    const exportData: ExportData[] = Object.entries(registrations).flatMap(([key, value]) => {
      if (key === 'individuals' && Array.isArray(value)) {
        const individuals = value as Registration[];
        return individuals.map(reg => ({
          'Registration Type': 'Individual',
          'Name': reg.name,
          'Email': reg.email,
          'Registration No': reg.registration_no,
          'Mobile No': reg.mobile_no,
          'Semester': reg.semester,
          'Status': reg.status,
          'Registration Date': new Date(reg.created_at).toLocaleString(),
          'Fee Paid': event.fee
        }));
      } else if (value && 'teamName' in value && Array.isArray((value as GroupRegistration).members)) {
        const groupReg = value as GroupRegistration;
        return groupReg.members.map(member => ({
          'Registration Type': 'Team',
          'Team Name': groupReg.teamName,
          'Name': member.name,
          'Email': member.email,
          'Registration No': member.registration_no,
          'Mobile No': member.mobile_no,
          'Semester': member.semester,
          'Role': member.isLeader ? 'Leader' : 'Member',
          'Status': member.status,
          'Registration Date': new Date(member.created_at).toLocaleString(),
          'Fee Paid': event.fee
        }));
      }
      return [];
    });

    exportToCSV(exportData, `event-registrations-${eventId}`);
  };

  const matchesSearchQuery = (registration: Registration): boolean => {
    return searchableFields.some(field => {
      const value = registration[field];
      return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const getFilteredRegistrations = (): RegistrationsData => {
    return Object.entries(registrations).reduce<RegistrationsData>((acc, [key, value]) => {
      if (key === 'individuals' && Array.isArray(value)) {
        const individuals = value as Registration[];
        const filtered = individuals.filter(matchesSearchQuery);
        if (filtered.length > 0) acc[key] = filtered;
      } else if (value && 'teamName' in value && Array.isArray((value as GroupRegistration).members)) {
        const groupReg = value as GroupRegistration;
        const filteredMembers = groupReg.members.filter(matchesSearchQuery);
        if (filteredMembers.length > 0) {
          acc[key] = { ...groupReg, members: filteredMembers };
        }
      }
      return acc;
    }, {});
  };

  const filteredRegistrations = getFilteredRegistrations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-300 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/admin/events')}
            className="primary-button"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Registrations</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search registrations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="mr-2" size={20} />
            Export to CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(filteredRegistrations).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            {key === 'individuals' && Array.isArray(value) ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Individual Registrations</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {value.map((reg) => (
                        <tr key={reg._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{reg.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{reg.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{reg.registration_no}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reg.status === 'attended' ? 'bg-green-100 text-green-800' :
                              reg.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">₹{event?.fee}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedTeam(reg._id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              <Eye size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : value && 'teamName' in value ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Team: {value.teamName}</h2>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Total Fee: ₹{value.totalFee}</span>
                  <button
                    onClick={() => setSelectedTeam(key)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Paid</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {value.members.map((member) => (
                        <tr key={member._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {member.isLeader ? 'Leader' : 'Member'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'attended' ? 'bg-green-100 text-green-800' :
                              member.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">₹{event?.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Registration Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Registration Details</h2>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {selectedTeam in registrations && registrations[selectedTeam] && 'teamName' in registrations[selectedTeam] ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Team: {(registrations[selectedTeam] as GroupRegistration).teamName}</h3>
                  <div className="space-y-4">
                    {(registrations[selectedTeam] as GroupRegistration).members.map((member) => (
                      <div key={member._id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{member.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            member.isLeader ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.isLeader ? 'Leader' : 'Member'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p>{member.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Registration No</p>
                            <p>{member.registration_no}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Mobile No</p>
                            <p>{member.mobile_no}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Semester</p>
                            <p>{member.semester}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              member.status === 'attended' ? 'bg-green-100 text-green-800' :
                              member.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-500">Fee Paid</p>
                            <p>₹{event?.fee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {registrations.individuals?.find(reg => reg._id === selectedTeam) && (
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Individual Registration</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p>{registrations.individuals?.find(reg => reg._id === selectedTeam)?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p>{registrations.individuals?.find(reg => reg._id === selectedTeam)?.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Registration No</p>
                          <p>{registrations.individuals?.find(reg => reg._id === selectedTeam)?.registration_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Mobile No</p>
                          <p>{registrations.individuals?.find(reg => reg._id === selectedTeam)?.mobile_no}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Semester</p>
                          <p>{registrations.individuals?.find(reg => reg._id === selectedTeam)?.semester}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            registrations.individuals?.find(reg => reg._id === selectedTeam)?.status === 'attended' ? 'bg-green-100 text-green-800' :
                            registrations.individuals?.find(reg => reg._id === selectedTeam)?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {registrations.individuals?.find(reg => reg._id === selectedTeam)?.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500">Fee Paid</p>
                          <p>₹{event?.fee}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations; 