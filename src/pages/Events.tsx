import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getUserRegistrations, getEventById } from '../services/api';
import { Calendar, MapPin, DollarSign, Users, User, Info, Pencil } from 'lucide-react';
import Layout from '../components/Layout';
import { handleError } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  venue: string;
  type: 'upcoming' | 'past' | string;
  eventType?: 'individual' | 'group' | string;
  fee?: number;
  maxTeamSize?: number;
  thumbnail?: string;
  rulebook?: string;
}

interface Registration {
  id: string;
  event: string;
  email: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  created_at: string;
  teamName?: string;
  isLeader?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<string, boolean>>({});

  // Function to normalize event data
  const normalizeEvent = (event: any): Event => {
    if (!event) {
      console.error('Received null or undefined event to normalize');
      return null as any;
    }
    
    const eventId = event.id || event._id || 'unknown';
    
    // Create normalized event object with defaults
    const normalizedEvent: Event = {
      id: event.id || event._id || '',
      title: event.title || 'Untitled Event',
      description: event.description || '',
      date: event.date || new Date().toISOString(),
      end_date: event.end_date || event.date || new Date().toISOString(),
      venue: event.venue || 'TBD',
      type: 'upcoming', // Will be determined below
      eventType: 'individual', // Default value
      fee: 0, // Default value
      thumbnail: '' // Default value
    };
    
    // Process eventType (individual/group)
    if (event.eventType) {
      const typeStr = String(event.eventType).toLowerCase().trim();
      if (typeStr === 'group' || typeStr === 'team') {
        normalizedEvent.eventType = 'group';
      } else if (typeStr === 'individual' || typeStr === 'solo') {
        normalizedEvent.eventType = 'individual';
      }
    }
    
    // Process fee
    if (event.fee !== undefined && event.fee !== null) {
      if (typeof event.fee === 'number' && !isNaN(event.fee)) {
        normalizedEvent.fee = event.fee;
      } else if (typeof event.fee === 'string') {
        const parsedFee = parseFloat(event.fee.trim());
        if (!isNaN(parsedFee)) {
          normalizedEvent.fee = parsedFee;
        }
      }
    }
    
    // Process thumbnail
    if (event.thumbnail) {
      const thumbStr = String(event.thumbnail).trim();
      if (thumbStr.startsWith('http://') || 
          thumbStr.startsWith('https://') || 
          thumbStr.startsWith('data:image/')) {
        normalizedEvent.thumbnail = thumbStr;
      }
    }
    
    // Determine if event is upcoming or past
    const eventDate = new Date(normalizedEvent.date);
    const now = new Date();
    normalizedEvent.type = eventDate > now ? 'upcoming' : 'past';
    
    return normalizedEvent;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        
        // Normalize all events before setting state
        if (Array.isArray(data)) {
          console.log('Normalizing events array:', data.length, 'events');
          const normalizedEvents = data.map(normalizeEvent);
          
          // Sort events by date - upcoming first, then by most recent date
          normalizedEvents.sort((a, b) => {
            // First, sort by upcoming/past (upcoming events first)
            if (a.type === 'upcoming' && b.type === 'past') return -1;
            if (a.type === 'past' && b.type === 'upcoming') return 1;
            
            // For upcoming events, sort by closest date first
            if (a.type === 'upcoming' && b.type === 'upcoming') {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            
            // For past events, sort by most recent first
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          setEvents(normalizedEvents);
        } else {
          console.error('Expected array of events but got:', typeof data);
          setEvents([]);
        }
        
        // Reset thumbnail errors
        setThumbnailErrors({});
        
        setError(null);
      } catch (err) {
        handleError(err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchUserRegistrations = async () => {
    if (!user) return;
    try {
      const data = await getUserRegistrations(user.email);
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
    }
  };

  const handleViewMore = async (eventId: string) => {
    try {
      const eventData = await getEventById(eventId);
      if (!eventData) {
        toast.error('Event not found');
        return;
      }
      
      // Normalize the event data before setting state
      const normalizedEvent = normalizeEvent(eventData);
      setSelectedEvent(normalizedEvent);
      setShowModal(true);
    } catch (err) {
      handleError(err);
      toast.error('Failed to load event details');
    }
  };

  const handleRegister = (eventId: string) => {
    try {
      if (!user) {
        toast.error('Please log in to register for events');
        navigate('/login', { state: { from: `/events/${eventId}/register` } });
        return;
      }

      // Check if user is already registered
      const existingRegistration = registrations.find(reg => reg.event === eventId);
      if (existingRegistration) {
        // If already registered, navigate to edit page
        navigate(`/events/${eventId}/edit`, { 
          state: { registration: existingRegistration } 
        });
        return;
      }
      
      // If not registered, navigate to registration page
      navigate(`/events/${eventId}/register`);
    } catch (err) {
      handleError(err);
      toast.error('Failed to navigate to registration page');
    }
  };

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter(event => event.type === filter);
  }, [events, filter]);

  // Handle thumbnail error and retry logic
  const handleThumbnailError = (eventId: string, thumbnailUrl?: string) => {
    console.error(`Failed to load image for event ${eventId}: ${thumbnailUrl || 'No URL'}`);
    setThumbnailErrors(prev => ({ ...prev, [eventId]: true }));
    
    // Try to load image with a different cache key
    if (thumbnailUrl && !thumbnailUrl.includes('cache=')) {
      const newUrl = `${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        // If successful with the new URL, clear the error
        setThumbnailErrors(prev => ({ ...prev, [eventId]: false }));
        
        // Update the src attribute of the image element if it exists
        const imgElement = document.querySelector(`img[data-event-id="${eventId}"]`) as HTMLImageElement;
        if (imgElement) {
          imgElement.src = newUrl;
        }
      };
      img.src = newUrl;
    }
  };

  return (
    <Layout>
      <div className="tech-background pb-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section with improved styling */}
          <div className="text-center mb-16 animate-slide-up relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-100 to-secondary-100 blur-xl rounded-3xl transform -translate-y-10"></div>
            <h1 className="text-4xl md:text-6xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              College Events
            </h1>
            <div className="w-32 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-5 rounded-full"></div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Explore and register for exciting events hosted by Sher-Shah Engineering College
            </p>
          </div>

          {/* Filter Tabs with improved styling */}
          <div className="mb-12 flex justify-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex bg-white/90 shadow-lg p-1.5 rounded-xl backdrop-blur-lg border border-gray-200/50">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100/50'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'upcoming'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100/50'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'past'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100/50'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Loading, Error and Empty States */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="w-16 h-16 relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary-400/20 border-t-primary-400 animate-spin"></div>
                <div className="w-16 h-16 rounded-full border-4 border-secondary-400/10 border-b-secondary-400 animate-spin absolute inset-0" style={{animationDuration: '1.5s'}}></div>
              </div>
              <p className="mt-4 text-gray-500">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 glass-card max-w-md mx-auto">
              <div className="text-red-500 flex flex-col items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-lg font-medium">{error}</p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2.5 primary-button"
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 glass-card max-w-xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-50 to-secondary-50"></div>
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-gradient mb-4">No events found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {filter === 'upcoming' 
                  ? 'There are no upcoming events at the moment. Please check back later.' 
                  : filter === 'past' 
                    ? 'There are no past events to display.' 
                    : 'No events are available.'}
              </p>
              <button 
                onClick={() => setFilter('all')} 
                className="px-6 py-2.5 inline-flex secondary-button mx-auto"
              >
                View All Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className="glass-card overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl animate-slide-up"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  {/* Event image with proper fallback */}
                  <div className="h-64 overflow-hidden relative bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`Thumbnail for event ${event.id} failed to load:`, event.thumbnail);
                          // Set error state for this thumbnail
                          setThumbnailErrors(prev => ({
                            ...prev,
                            [event.id]: true
                          }));
                          
                          // Try to load with cache busting
                          if (event.thumbnail && !event.thumbnail.includes('cache=')) {
                            const newSrc = `${event.thumbnail}${event.thumbnail.includes('?') ? '&' : '?'}cache=${Date.now()}`;
                            console.log(`Trying cache-busting URL for event ${event.id}:`, newSrc);
                            
                            const newImg = new Image();
                            newImg.onload = () => {
                              console.log(`Cache-busting worked for event ${event.id}`);
                              // If successful, update the image src
                              const target = e.target as HTMLImageElement;
                              if (target) target.src = newSrc;
                              // Clear the error state
                              setThumbnailErrors(prev => ({
                                ...prev,
                                [event.id]: false
                              }));
                            };
                            newImg.src = newSrc;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900/70 to-transparent">
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2" />
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Event Badges with correct display for event type */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center
                        ${event.eventType === 'group' || event.eventType === 'team'
                          ? 'bg-secondary-100 text-secondary-600' 
                          : 'bg-primary-100 text-primary-600'}`}
                      >
                        {event.eventType === 'group' || event.eventType === 'team' ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            <span>Group</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            <span>Individual</span>
                          </>
                        )}
                      </div>
                      
                      {/* Fee badge with correct display */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center
                        ${typeof event.fee === 'number' && event.fee > 0 
                          ? 'bg-amber-100 text-amber-600' 
                          : 'bg-green-100 text-green-600'}`}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        {typeof event.fee === 'number' && event.fee > 0 ? 'Paid' : 'Free'}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-gray-800 hover:text-primary-600 transition-colors line-clamp-1">{event.title}</h3>
                    
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    
                      <div className="flex items-center col-span-2">
                        <DollarSign className="w-4 h-4 mr-2 text-primary-500" />
                        {typeof event.fee === 'number' && event.fee > 0 ? (
                          <span className="text-gray-600">
                            ₹{event.fee} {event.eventType === 'group' || event.eventType === 'team' ? 'per team' : 'per person'}
                          </span>
                        ) : (
                          <span className="text-green-600 font-medium">Free Event</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      {event.type === 'upcoming' && (
                        <>
                          {registrations.find(reg => reg.event === event.id) ? (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit Registration
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Register Now
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleViewMore(event.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Info className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Details Modal with improved styling */}
        {selectedEvent && showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={selectedEvent.title}
            size="lg"
          >
            <div className="space-y-6">
              {/* Event Image with improved error handling */}
              <div className="glass-card rounded-lg overflow-hidden h-96 relative bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                {selectedEvent.thumbnail && !thumbnailErrors[selectedEvent.id] ? (
                  <img
                    src={`${selectedEvent.thumbnail}`}
                    data-event-id={selectedEvent.id}
                    alt={selectedEvent.title}
                    onError={() => handleThumbnailError(selectedEvent.id, selectedEvent.thumbnail)}
                    className="w-full h-full object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 mb-2">
                      {selectedEvent.title.charAt(0)}
                    </div>
                    <p className="text-sm text-gray-500">Event thumbnail not available</p>
                  </div>
                )}
              </div>

              {/* Event Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="glass-card p-5 flex items-start rounded-lg transition-all duration-300 hover:shadow-lg">
                  <Calendar className="h-6 w-6 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-600 mb-2">Date</h3>
                    <p className="text-gray-600">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start rounded-lg transition-all duration-300 hover:shadow-lg">
                  <MapPin className="h-6 w-6 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-600 mb-2">Venue</h3>
                    <p className="text-gray-600">{selectedEvent.venue}</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start rounded-lg transition-all duration-300 hover:shadow-lg">
                  {selectedEvent.eventType === 'group' ? (
                    <Users className="h-6 w-6 mr-3 text-secondary-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <User className="h-6 w-6 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-primary-600 mb-2">Event Type</h3>
                    <p className={`font-medium ${selectedEvent.eventType === 'group' ? 'text-secondary-600' : 'text-primary-600'}`}>
                      {selectedEvent.eventType === 'group' ? 'Group Event' : 'Individual Event'}
                    </p>
                    {selectedEvent.eventType === 'group' && selectedEvent.maxTeamSize && (
                      <p className="text-gray-500 mt-1 text-sm">Max team size: {selectedEvent.maxTeamSize}</p>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start rounded-lg transition-all duration-300 hover:shadow-lg">
                  <DollarSign className="h-6 w-6 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-primary-600 mb-2">Registration Fee</h3>
                    {typeof selectedEvent.fee === 'number' && selectedEvent.fee > 0 ? (
                      <p className="text-amber-600 font-medium">
                        ₹{selectedEvent.fee} {selectedEvent.eventType === 'group' ? 'per team' : 'per person'}
                      </p>
                    ) : (
                      <p className="text-green-600 font-medium">Free Event</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description with improved styling */}
              <div className="glass-card p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-600 mb-3">About the Event</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              {/* Registration Status and Actions */}
              <div className="flex justify-end gap-3">
                {selectedEvent.type === 'upcoming' && (
                  <>
                    {registrations.some(reg => reg.event === selectedEvent.id) ? (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <span>Registered</span>
                        <button
                          onClick={() => {
                            setShowModal(false);
                            navigate(`/events/${selectedEvent.id}/register`);
                          }}
                          className="text-primary-600 hover:text-primary-700 transition-colors"
                          title="Edit Registration"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowModal(false);
                          handleRegister(selectedEvent.id);
                        }}
                        className="primary-button"
                      >
                        Register Now
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Events;