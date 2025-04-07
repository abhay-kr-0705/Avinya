import React, { useState, useEffect } from 'react';
import { getLeaderboard, getEvents } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { Search, TrendingUp, Award, Calendar, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  thumbnail?: string;
}

interface LeaderboardEntry {
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

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leaderboardData, eventsData] = await Promise.all([
          getLeaderboard(),
          getEvents()
        ]);
        
        setLeaderboard(leaderboardData);
        setEvents(eventsData);
      } catch (error) {
        handleError(error, 'Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter leaderboard data based on selected event and search term
  const filteredLeaderboard = leaderboard.filter(entry => {
    const matchesEvent = selectedEvent ? entry.eventName === selectedEvent : true;
    const matchesSearch = searchTerm 
      ? entry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.college.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesEvent && matchesSearch;
  });

  // Group events by category for better organization
  const eventsByCategory = events.reduce<Record<string, Event[]>>((acc, event) => {
    const category = event.category || 'Others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {});

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'First':
        return 'bg-amber-500';
      case 'Second':
        return 'bg-gray-400';
      case 'Third':
        return 'bg-amber-700';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
            <Award className="h-8 w-8 mr-3" />
            Leaderboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Celebrating the achievements of our participants across various events
          </p>
        </div>

        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg bg-dark-800/80 border-dark-600 text-white pl-10 pr-4 py-3 focus:border-primary-500 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(e.target.value || null)}
                className="w-full rounded-lg bg-dark-800/80 border-dark-600 text-white py-3 px-4 focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.title}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-medium text-gray-300 mb-2">No leaderboard entries found</h3>
            <p className="text-gray-400">
              {selectedEvent 
                ? `No participants for ${selectedEvent} match your search criteria.` 
                : "No participants match your search criteria."}
            </p>
            {(selectedEvent || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Winners Section */}
            {!searchTerm && filteredLeaderboard.filter(entry => entry.rank <= 3).length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                  <TrendingUp className="mr-2" /> Top Performers
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredLeaderboard
                    .filter(entry => entry.rank <= 3)
                    .sort((a, b) => a.rank - b.rank)
                    .map((entry) => (
                      <div key={entry.id} className="glass-card hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-dark-800 border-4 border-dark-900 flex items-center justify-center">
                            <div className={`w-9 h-9 rounded-full ${getPositionColor(entry.position)} flex items-center justify-center`}>
                              <span className="text-white font-bold">{entry.rank}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-8 px-6 pb-6 text-center">
                          {entry.thumbnail ? (
                            <img 
                              src={entry.thumbnail} 
                              alt={entry.name} 
                              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-primary-500"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">{entry.name.charAt(0)}</span>
                            </div>
                          )}
                          
                          <h3 className="text-xl font-bold text-white mb-1">{entry.name}</h3>
                          <p className="text-gray-400 mb-3">{entry.college}</p>
                          
                          <div className="bg-dark-800/50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-300 mb-1">
                              <span className="text-primary-400">Event:</span> {entry.eventName}
                            </p>
                            <p className="text-sm text-gray-300">
                              <span className="text-primary-400">Category:</span> {entry.category}
                            </p>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-2 rounded-lg">
                            <div className="text-2xl font-bold text-primary-300">{entry.points} pts</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Complete Leaderboard Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-dark-700">
                <h2 className="text-xl font-bold text-white">
                  {selectedEvent ? `${selectedEvent} Leaderboard` : 'Complete Leaderboard'}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-dark-800">
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Rank</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Participant</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">College</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Event</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Category</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Position</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Points</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {filteredLeaderboard.sort((a, b) => a.rank - b.rank).map((entry) => (
                      <tr key={entry.id} className="hover:bg-dark-800/50 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{entry.rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {entry.thumbnail ? (
                              <img src={entry.thumbnail} alt={entry.name} className="w-8 h-8 rounded-full mr-2 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center mr-2">
                                <span className="text-white text-sm font-medium">{entry.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-white">{entry.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{entry.college}</td>
                        <td className="px-6 py-4 text-gray-300">{entry.eventName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                            ${entry.category === 'Technical' ? 'bg-blue-900/40 text-blue-400' :
                            entry.category === 'Non-Technical' ? 'bg-green-900/40 text-green-400' :
                            entry.category === 'Cultural' ? 'bg-purple-900/40 text-purple-400' :
                            entry.category === 'Sports' ? 'bg-orange-900/40 text-orange-400' :
                            entry.category === 'Gaming' ? 'bg-red-900/40 text-red-400' :
                            'bg-gray-800 text-gray-400'}
                          `}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                            ${entry.position === 'First' ? 'bg-amber-900/40 text-amber-400' :
                            entry.position === 'Second' ? 'bg-gray-800 text-gray-300' :
                            entry.position === 'Third' ? 'bg-amber-800/40 text-amber-600' :
                            'bg-dark-800 text-gray-400'}
                          `}>
                            {entry.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-primary-400 font-bold">{entry.points}</td>
                        <td className="px-6 py-4 text-gray-300">{entry.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            <Calendar className="mr-2" /> Browse Events
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="glass-card hover:shadow-lg transition-shadow">
                {event.thumbnail && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.thumbnail} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <button
                    onClick={() => setSelectedEvent(event.title)}
                    className="text-primary-400 hover:text-primary-300 flex items-center text-sm font-medium transition-colors"
                  >
                    View Leaderboard <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {events.length > 6 && (
            <div className="text-center mt-8">
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md">
                View All Events
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard; 