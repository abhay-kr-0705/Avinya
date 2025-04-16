import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaImages, FaBook } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { getAllUsers, getAllEventsWithRegistrations, createEvent } from '../../services/adminApi';
import { Card, Row, Col, Title, Text, Statistic, Table, Tag, Input } from 'antd';
import {
  CalendarOutlined,
  FileOutlined,
  PictureOutlined,
  UserOutlined,
  LineChartOutlined,
  TeamOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { handleError } from '../../utils/errorHandling';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  registration_no?: string;
  branch?: string;
  semester?: string;
  mobile?: string;
}

interface AdminEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  type: 'upcoming' | 'past';
  registrations: any[];
  eventType?: 'individual' | 'group';
  fee?: number;
  maxTeamSize?: number;
  thumbnail?: string;
}

const INITIAL_USERS_TO_SHOW = 7;
const USERS_PER_LOAD = 5;

const Dashboard = () => {
  const { user, checkAuthSilently } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleUsers, setVisibleUsers] = useState(INITIAL_USERS_TO_SHOW);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    end_date: '',
    venue: '',
  });

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuthSilently();
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/admin' } });
        return;
      }
      
      if (user && !['admin', 'superadmin'].includes(user.role || '')) {
        navigate('/unauthorized');
        return;
      }
      
      fetchDashboardStats();
    };
    
    verifyAuth();
  }, [user]);

  useEffect(() => {
    setVisibleUsers(INITIAL_USERS_TO_SHOW);
    setHasMore(true);
  }, [searchQuery]);

  const lastUserElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setVisibleUsers(prev => {
          const newValue = prev + USERS_PER_LOAD;
          if (newValue >= filteredAndSortedUsers.length) {
            setHasMore(false);
          }
          return newValue;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, eventsResponse] = await Promise.all([
        getAllUsers(),
        getAllEventsWithRegistrations()
      ]);

      const usersData = usersResponse.data;
      const eventsData = eventsResponse.data;
      setEvents(eventsData);
      setUsers(usersData);

      const upcomingEvents = eventsData.filter(event => 
        new Date(event.date) > new Date()
      ).length;

      setStats({
        totalUsers: usersData.length,
        totalEvents: eventsData.length,
        totalRegistrations: eventsData.reduce((total, event) => total + event.registrations.length, 0),
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.registration_no?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      if ((a.role === 'admin' || a.role === 'superadmin') && (b.role !== 'admin' && b.role !== 'superadmin')) {
        return -1;
      }
      if ((b.role === 'admin' || b.role === 'superadmin') && (a.role !== 'admin' && a.role !== 'superadmin')) {
        return 1;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [users, searchQuery]);

  const visibleUsersList = useMemo(() => {
    return filteredAndSortedUsers.slice(0, visibleUsers);
  }, [filteredAndSortedUsers, visibleUsers]);

  const pastEvents = useMemo(() => {
    return events.filter(event => new Date(event.date) < new Date());
  }, [events]);

  const handleUserClick = (userId: string) => {
    navigate(`/admin/user/${userId}`); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createEvent(form);
      toast.success('Event created successfully');
      setShowForm(false);
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  // Function to format date to dd/mm/yy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage and monitor all aspects of your platform
          </p>
        </div>

        {/* Management Section */}
        <div className="mb-12">
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Link to="/admin/events">
                <Card 
                  hoverable 
                  className="h-full bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <CalendarOutlined className="text-4xl text-blue-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Manage Events</h3>
                    <p className="text-gray-600">Add, edit, or remove events</p>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Link to="/admin/resources">
                <Card 
                  hoverable 
                  className="h-full bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <FileOutlined className="text-4xl text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Manage Resources</h3>
                    <p className="text-gray-600">Add or remove learning resources</p>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Link to="/admin/gallery">
                <Card 
                  hoverable 
                  className="h-full bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <PictureOutlined className="text-4xl text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Manage Gallery</h3>
                    <p className="text-gray-600">Add or remove gallery images</p>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} lg={8} className="mb-4">
              <Link to="/admin/leaderboard">
                <Card 
                  hoverable 
                  className="h-full glass-card border-primary-600 transition-all duration-300 hover:border-primary-400 hover:shadow-lg"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <LineChartOutlined className="text-3xl text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Manage Leaderboard</h3>
                    <p className="text-gray-400">Update scores and participants</p>
                  </div>
                </Card>
              </Link>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Link to="/admin/users">
                <Card 
                  hoverable 
                  className="h-full bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <UserOutlined className="text-4xl text-red-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
                    <p className="text-gray-600">View and manage user accounts</p>
                  </div>
                </Card>
              </Link>
            </Col>
          </Row>
        </div>

        {/* User List Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow lg:col-span-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FaUsers className="w-8 h-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>

              <div className="relative">
                <Input
                  placeholder="Search by name, email, or reg. no"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg">
              <div className="max-h-[500px] overflow-y-auto" id="scrollableDiv">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleUsersList.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => handleUserClick(user.id)}
                        ref={index === visibleUsersList.length - 1 ? lastUserElementRef : null}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.registration_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.semester}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-green-100 text-green-800' : 
                            user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loading && (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;