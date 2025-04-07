import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvents, normalizeEvent } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { Calendar, MapPin, ArrowRight, ArrowUpRight, ChevronRight, Users, DollarSign, Clock, Award } from 'lucide-react';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

// Define Event interface to match API response
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date?: string;
  venue: string;
  type?: 'upcoming' | 'past' | string;
  eventType?: 'individual' | 'group' | string;
  fee?: number;
  maxTeamSize?: number;
  thumbnail?: string;
}

// Main Home component
const Home = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for the interactive hero background
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const events = await getEvents();
      
      // Log the response to debug
      console.log('Events API response:', events);
      
      if (Array.isArray(events) && events.length > 0) {
        const now = new Date();
        
        // Filter events where date is greater than current date
        const upcoming = events
          .filter((event: Event) => {
            try {
              const eventDate = new Date(event.date);
              return !isNaN(eventDate.getTime()) && eventDate > now;
            } catch (err) {
              console.error(`Invalid date format for event ${event.id || 'unknown'}:`, event.date);
              return false;
            }
          })
          .slice(0, 3); // Get only the next 3 upcoming events
        
        console.log('Filtered upcoming events:', upcoming);
        
        if (upcoming.length > 0) {
          // Events should already be normalized from the API layer
          console.log('Home: Upcoming events to display:', upcoming.map(e => ({
            id: e.id,
            title: e.title,
            eventType: e.eventType,
            fee: e.fee,
            hasThumbnail: !!e.thumbnail
          })));
          setUpcomingEvents(upcoming);
        } else {
          console.log('No upcoming events found after filtering');
          setUpcomingEvents([]);
        }
      } else {
        console.error('Events API did not return a valid array:', events);
        toast.error('Failed to fetch upcoming events');
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      handleError(error, 'Failed to fetch upcoming events');
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days until event
  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Layout pageTitle="GenSpark - The Ultimate Tech Fest">
      {/* Enhanced Hero Section with interactive background */}
      <section ref={heroRef} className="relative min-h-[90vh] py-16 md:py-24 flex items-center justify-center overflow-hidden">
        {/* Background gradients and effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-50 opacity-90"></div>
        <div className="absolute inset-0 bg-tech-pattern opacity-10"></div>
        
        {/* Animated blob decorations */}
        <div className="absolute top-1/3 -left-24 md:-left-12 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -right-24 md:-right-12 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Interactive animated background elements */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Animated tech grid lines */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div 
                key={`v-${i}`} 
                className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary-400/10 to-transparent"
                style={{
                  left: `${(i + 1) * 16.66}%`,
                  transform: `translateX(-50%) rotateY(${(mousePosition.x / 50) - 10}deg)`,
                  transition: 'transform 0.1s ease'
                }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div 
                key={`h-${i}`} 
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-secondary-400/10 to-transparent"
                style={{
                  top: `${(i + 1) * 16.66}%`,
                  transform: `translateY(-50%) rotateX(${(mousePosition.y / 50) - 10}deg)`,
                  transition: 'transform 0.1s ease'
                }}
              />
            ))}
          </div>

          {/* Floating tech particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div 
                key={`p-${i}`}
                className="absolute w-1 h-1 rounded-full bg-primary-300/50 animate-pulse-slow"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  transform: `translate(${(mousePosition.x - (window.innerWidth / 2)) / 50}px, ${(mousePosition.y - (window.innerHeight / 2)) / 50}px)`,
                  transition: 'transform 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6 animate-fadeIn glass-card p-8 rounded-xl shadow-lg border border-white/20 backdrop-blur-sm">
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 inline-block">
                  Welcome to
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-800 to-secondary-800 animate-pulse-slow">
                  GenSpark 2024
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Unleash Your Potential in the Ultimate Tech Battle at Sershah Engineering College
              </p>
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <Link to="/events" className="primary-button py-3 px-8 text-lg font-medium shadow-lg flex items-center justify-center" style={{
                transform: `translateY(${(mousePosition.y - (window.innerHeight / 2)) / 100}px) translateX(${(mousePosition.x - (window.innerWidth / 2)) / 100}px)`,
                transition: 'transform 0.3s ease'
              }}>
                <span>Explore Events</span>
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link to="/signup" className="secondary-button py-3 px-8 text-lg font-medium shadow-lg flex items-center justify-center" style={{
                transform: `translateY(${(mousePosition.y - (window.innerHeight / 2)) / -100}px) translateX(${(mousePosition.x - (window.innerWidth / 2)) / -100}px)`,
                transition: 'transform 0.3s ease'
              }}>
                <span>Join the Community</span>
                <ArrowUpRight className="inline-block ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce md:block hidden">
          <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Upcoming Events Section - Redesigned */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              Upcoming Events
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on our exciting upcoming events! Join us to learn, grow, and connect with fellow tech enthusiasts.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
                <div className="w-20 h-20 rounded-full border-4 border-transparent border-b-secondary-500 animate-spin absolute inset-0" style={{ animationDuration: '1.2s' }}></div>
              </div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="glass-card group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative"
                >
                  {/* Thumbnail */}
                  <div className="h-52 overflow-hidden relative">
                    {event.thumbnail ? (
                      <img 
                        src={event.thumbnail} 
                        alt={event.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          console.log(`Thumbnail for event ${event.id} failed to load:`, event.thumbnail);
                          // Hide the broken image and show a fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          
                          if (parent) {
                            parent.classList.add('bg-gradient-to-r', 'from-primary-100', 'to-secondary-100');
                            
                            // Create fallback content
                            const fallback = document.createElement('div');
                            fallback.className = 'flex items-center justify-center h-full w-full';
                            fallback.innerHTML = `
                              <div class="text-4xl font-bold text-primary-500">
                                ${event.title.charAt(0).toUpperCase()}
                              </div>
                            `;
                            parent.appendChild(fallback);
                            
                            // Try to load with cache busting
                            if (event.thumbnail && !event.thumbnail.includes('cache=')) {
                              const newSrc = `${event.thumbnail}${event.thumbnail.includes('?') ? '&' : '?'}cache=${Date.now()}`;
                              console.log(`Trying cache-busting URL for event ${event.id}:`, newSrc);
                              
                              const newImg = new Image();
                              newImg.onload = () => {
                                console.log(`Cache-busting worked for event ${event.id}`);
                                // If successful, replace the fallback
                                parent.innerHTML = '';
                                const img = document.createElement('img');
                                img.src = newSrc;
                                img.alt = event.title;
                                img.className = 'w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700';
                                parent.appendChild(img);
                                // Remove the background classes
                                parent.classList.remove('bg-gradient-to-r', 'from-primary-100', 'to-secondary-100');
                              };
                              newImg.src = newSrc;
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 h-full w-full flex items-center justify-center">
                        <div className="text-4xl font-bold text-primary-500">
                          {event.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Badge for event type (individual/group) */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider 
                        ${event.eventType === 'group' || event.eventType === 'team'
                          ? 'bg-secondary-500 text-white' 
                          : 'bg-primary-500 text-white'}`}
                      >
                        {event.eventType === 'group' || event.eventType === 'team' ? 'Team' : 'Individual'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{event.title}</h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span>
                        {formatDate(event.date)}
                        {event.end_date && ` - ${formatDate(event.end_date)}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    
                    {/* Fee information */}
                    <div className="flex items-center space-x-2 mb-5 text-sm">
                      <DollarSign className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      {typeof event.fee === 'number' && event.fee > 0 ? (
                        <span className="text-gray-600">
                          ₹{event.fee} {event.eventType === 'group' || event.eventType === 'team' ? 'per team' : 'per person'}
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">Free Event</span>
                      )}
                    </div>

                    <Link 
                      to={`/events/${event.id}/register`} 
                      className="w-full primary-button inline-flex items-center justify-center"
                    >
                      Register Now
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card max-w-2xl mx-auto text-center py-16 px-4 border border-gray-200/50">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-gray-800">No upcoming events at the moment</h3>
              <p className="text-gray-600 mb-8">
                We're working on planning some amazing events. Check back soon for updates!
              </p>
              <Link
                to="/events"
                className="secondary-button inline-flex items-center px-6 py-3"
              >
                View All Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/events"
              className="primary-button inline-flex items-center px-8 py-3"
            >
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Completely Redesigned for Better Readability */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-900 to-primary-900">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-300 rounded-full opacity-10 translate-x-1/3 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-300 rounded-full opacity-10 -translate-x-1/3 translate-y-1/2 blur-3xl"></div>
          <div className="absolute inset-0 bg-tech-pattern opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold sm:text-5xl text-white drop-shadow-md">
              About{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-100 to-secondary-100 drop-shadow-lg">
                Sershah Engineering College
              </span>
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-primary-100 to-secondary-100 rounded mx-auto mt-4"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-10">
              <p className="text-lg text-gray-800 leading-relaxed mb-6">
              Shershah Engineering College, Sasaram was established in 2016 by the Government of Bihar under the Department of Science and Technology. Shershah Engineering College, Sasaram (SEC Sasaram) stands as a beacon of technical excellence. Spanning 21 acres in the historic city of Sasaram, Rohtas, the college nurtures future engineers with cutting-edge education and innovation-driven learning. Affiliated with Bihar Engineering University, Patna, and approved by AICTE, New Delhi. SEC Sasaram is dedicated to empowering students with industry-relevant skills, fostering research, and driving technological advancements. With a vision to shape the future of engineering, we are committed to excellence, creativity, and transformation in the field of technology.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-primary-100 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Location</h3>
                  </div>
                  <p className="text-gray-700 pl-10">Sasaram, Bihar</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-secondary-100 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Affiliation</h3>
                  </div>
                  <p className="text-gray-700 pl-10">Bihar Engineering University</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-full bg-primary-100 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900">Established</h3>
                  </div>
                  <p className="text-gray-700 pl-10">2016</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Link
                  to="/about"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  Learn More About GenSpark
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;