import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getEventRegistrations } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import { 
  Users, User, Calendar, MapPin, Download, ChevronDown, ChevronUp, 
  Mail, Phone, School, BookOpen, UserCheck, Search, DollarSign, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMember {
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  college: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  registration_no: string;
  mobile_no: string;
  semester: string;
  college: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  payment_status?: 'pending' | 'completed';
  payment_amount?: number;
  teamName?: string;
  members?: TeamMember[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  eventType?: 'individual' | 'group';
  fee?: number;
  maxTeamSize?: number;
  thumbnail?: string;
}

const EventRegistrations = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!eventId) {
      navigate('/admin/events');
      return;
    }
    fetchEventAndRegistrations();
  }, [eventId, navigate]);

  const fetchEventAndRegistrations = async () => {
    try {
      setLoading(true);
      const [eventData, registrationsData] = await Promise.all([
        getEventById(eventId as string),
        getEventRegistrations(eventId as string)
      ]);
      
      setEvent(eventData);
      setRegistrations(registrationsData);
    } catch (error) {
      handleError(error, 'Failed to fetch event data');
      navigate('/admin/events');
    } finally {
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

  const exportToCSV = () => {
    try {
      const headers = ['Name', 'Email', 'Registration No', 'Mobile', 'College', 'Semester', 'Status', 'Registration Date'];
      
      // Add team-specific headers if this is a group event
      if (event?.eventType === 'group') {
        headers.push('Team Name', 'Team Size');
      }
      
      let csvContent = headers.join(',') + '\n';
      
      registrations.forEach(reg => {
        const row = [
          `"${reg.name}"`,
          `"${reg.email}"`,
          `"${reg.registration_no}"`,
          `"${reg.mobile_no}"`,
          `"${reg.college}"`,
          `"${reg.semester}"`,
          `"${reg.status}"`,
          `"${new Date(reg.created_at).toLocaleDateString()}"`,
        ];
        
        // Add team data if group event
        if (event?.eventType === 'group') {
          row.push(
            `"${reg.teamName || ''}"`,
            `"${(reg.members?.length || 0) + 1}"` // +1 for team leader
          );
        }
        
        csvContent += row.join(',') + '\n';
        
        // Add team members if applicable
        if (event?.eventType === 'group' && reg.members && reg.members.length > 0) {
          reg.members.forEach((member, index) => {
            const memberRow = [
              `"${member.name} (Member ${index + 1})"`,
              `"${member.email}"`,
              `"${member.registration_no}"`,
              `"${member.mobile_no}"`,
              `"${member.college}"`,
              `"${member.semester}"`,
              `"${reg.status}"`,
              `"${new Date(reg.created_at).toLocaleDateString()}"`,
              `"${reg.teamName || ''}"`,
              `""` // No team size for members
            ];
            csvContent += memberRow.join(',') + '\n';
          });
        }
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${event?.title || 'event'}-registrations.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Registrations exported successfully');
    } catch (error) {
      handleError(error, 'Failed to export registrations');
    }
  };

  // Filter and sort registrations
  const filteredRegistrations = registrations
    .filter(reg => {
      // Apply search filter
      const searchFields = [
        reg.name, 
        reg.email, 
        reg.registration_no, 
        reg.mobile_no, 
        reg.college,
        reg.teamName || ''
      ];
      
      const matchesSearch = searchTerm === '' || 
        searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Handle sorting
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'college':
          valueA = a.college;
          valueB = b.college;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'created_at':
        default:
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
      }
      
      // Compare values based on sort direction
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });

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
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center"
        >
          <ChevronUp className="h-4 w-4 mr-1" />
          Back to Events
        </button>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-300 mb-4">{event.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-4 w-4 mr-2 text-primary-400" />
                <span>
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric' 
                  })}
                  {' - '}
                  {new Date(event.end_date).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                <span>{event.venue}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                {event.eventType === 'individual' ? (
                  <>
                    <User className="h-4 w-4 mr-2 text-primary-400" />
                    <span>Individual Event</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2 text-primary-400" />
                    <span>Group Event {event.maxTeamSize && `(Max ${event.maxTeamSize} members)`}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-center bg-dark-800/50 rounded-lg p-4">
            <div className="text-4xl font-bold text-primary-400 mb-2">
              {filteredRegistrations.length}
            </div>
            <div className="text-gray-300 text-center">
              {event.eventType === 'group' ? 'Teams Registered' : 'Participants Registered'}
            </div>
            
            <div className="mt-4">
              <button 
                onClick={exportToCSV}
                className="primary-button flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold">
            {event.eventType === 'group' ? 'Team Registrations' : 'Participant Registrations'} 
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md bg-dark-800 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md bg-dark-800 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No registrations found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Share the event link to get participants registered'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('college')}
                  >
                    <div className="flex items-center">
                      College
                      {sortField === 'college' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  {event.eventType === 'group' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Team
                    </th>
                  )}
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Registered On
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="w-4 h-4 ml-1" /> : 
                          <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredRegistrations.map((registration, index) => (
                  <React.Fragment key={registration.id}>
                    <tr className="hover:bg-dark-800/50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-white">{registration.name}</div>
                        <div className="text-xs text-gray-400">{registration.registration_no}</div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center text-gray-300 mb-1">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          <span>{registration.email}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          <span>{registration.mobile_no}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="text-gray-300">{registration.college}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>Semester {registration.semester}</span>
                        </div>
                      </td>
                      {event.eventType === 'group' && (
                        <td className="px-4 py-4 text-sm">
                          <div className="text-white font-medium">{registration.teamName || 'N/A'}</div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{(registration.members?.length || 0) + 1} members</span>
                          </div>
                          {registration.members && registration.members.length > 0 && (
                            <button
                              onClick={() => toggleExpandRow(registration.id)}
                              className="text-xs text-primary-400 hover:text-primary-300 mt-1 flex items-center"
                            >
                              {expandedRows[registration.id] ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Hide members
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  View members
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.status === 'confirmed' 
                            ? 'bg-green-900 text-green-300' 
                            : registration.status === 'rejected'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {registration.status}
                        </span>
                        
                        {event.fee && (
                          <div className="mt-1">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registration.payment_status === 'completed' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {registration.payment_status === 'completed' ? 'Paid' : 'Payment Pending'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {registration.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateRegistrationStatus(registration.id, 'confirmed')}
                                className="p-1 bg-green-900 text-green-300 rounded hover:bg-green-800"
                                title="Confirm Registration"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateRegistrationStatus(registration.id, 'rejected')}
                                className="p-1 bg-red-900 text-red-300 rounded hover:bg-red-800"
                                title="Reject Registration"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {event.fee && registration.payment_status !== 'completed' && (
                            <button
                              onClick={() => updatePaymentStatus(registration.id, 'completed')}
                              className="p-1 bg-primary-900 text-primary-300 rounded hover:bg-primary-800"
                              title="Mark as Paid"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded row for team members */}
                    {event.eventType === 'group' && 
                     expandedRows[registration.id] && 
                     registration.members && 
                     registration.members.length > 0 && (
                      <tr className="bg-dark-900">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="bg-dark-800 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-white mb-3">Team Members</h4>
                            <div className="space-y-4">
                              {registration.members.map((member, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-dark-700 pb-3">
                                  <div>
                                    <div className="font-medium text-white">{member.name}</div>
                                    <div className="text-xs text-gray-400">{member.registration_no}</div>
                                  </div>
                                  <div>
                                    <div className="flex items-center text-gray-300 mb-1">
                                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                                      <span>{member.email}</span>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                      <span>{member.mobile_no}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-gray-300">{member.college}</div>
                                    <div className="flex items-center text-xs text-gray-400 mt-1">
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      <span>Semester {member.semester}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations; 