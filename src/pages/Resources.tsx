import React, { useEffect, useState } from 'react';
import { getLeaderboard, Participant } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { Search, Trophy, Users, User, Filter, Award } from 'lucide-react';

const EVENT_CATEGORIES = [
  'Technical',
  'Coding',
  'Robotics',
  'Electronics',
  'Machine Learning',
  'Web Development',
  'App Development',
  'Cybersecurity',
  'Design',
  'Gaming',
  'Quiz',
  'Hackathon',
  'All'
] as const;

type RankedParticipant = Participant & {
  totalScore: number;
  rank: number;
};

const Leaderboard = () => {
  const [participants, setParticipants] = useState<RankedParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [participantType, setParticipantType] = useState<'all' | 'individual' | 'team'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      
      // Calculate total scores and assign ranks
      const processedData = data
        .map((participant: Participant) => ({
          ...participant,
          totalScore: participant.scores.reduce((sum: number, score: { score: number }) => sum + score.score, 0)
        }))
        .sort((a: { totalScore: number }, b: { totalScore: number }) => b.totalScore - a.totalScore)
        .map((participant: Participant & { totalScore: number }, index: number) => ({
          ...participant,
          rank: index + 1
        })) as RankedParticipant[];
      
      setParticipants(processedData);
    } catch (error) {
      handleError(error, 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredParticipants = () => {
    return participants.filter(participant => {
      // Filter by search term
      const matchesSearch = 
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (participant.college && participant.college.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by participant type
      const matchesType = 
        participantType === 'all' || 
        participant.type === participantType;
      
      // Filter by category
      const matchesCategory = 
        selectedCategory === 'All' || 
        participant.scores.some(score => score.category === selectedCategory);
        
      return matchesSearch && matchesType && matchesCategory;
    });
  };

  const filteredParticipants = getFilteredParticipants();

  // Get the top 3 participants for the medals
  const topThree = filteredParticipants.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen tech-background py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Header with animated gradient text */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="mixed-gradient-text">Leaderboard</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Track the rankings of individual participants and teams across all events
            </p>
          </div>

          {/* Top 3 Podium for Desktop */}
          {topThree.length > 0 && (
            <div className="hidden md:flex justify-center items-end h-64 mb-8 space-x-4">
              {/* 2nd Place */}
              {topThree.length > 1 && (
                <div className="flex flex-col items-center">
                  <div className="glass-card p-4 text-center mb-2 w-48">
                    <div className="text-xl font-bold text-white mb-1 truncate">{topThree[1].name}</div>
                    <div className="text-xl font-bold text-primary-300">{topThree[1].totalScore} pts</div>
                    <div className="text-sm text-gray-400 truncate">{topThree[1].college}</div>
                  </div>
                  <div className="h-32 w-24 bg-dark-800 rounded-t-lg flex items-center justify-center border-t-2 border-l-2 border-r-2 border-gray-700">
                    <div className="text-4xl text-gray-300 font-bold flex items-center">
                      <Award className="h-8 w-8 text-gray-300 mr-1" />
                      2
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="glass-card p-4 text-center mb-2 w-48 neon-border">
                    <div className="text-2xl font-bold text-white mb-1 truncate">{topThree[0].name}</div>
                    <div className="text-2xl font-bold text-primary-300">{topThree[0].totalScore} pts</div>
                    <div className="text-sm text-gray-400 truncate">{topThree[0].college}</div>
                  </div>
                  <div className="h-40 w-24 bg-dark-800 rounded-t-lg flex items-center justify-center border-t-2 border-l-2 border-r-2 border-primary-500">
                    <div className="text-4xl text-primary-300 font-bold flex items-center">
                      <Trophy className="h-8 w-8 text-primary-300 mr-1" />
                      1
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree.length > 2 && (
                <div className="flex flex-col items-center">
                  <div className="glass-card p-4 text-center mb-2 w-48">
                    <div className="text-xl font-bold text-white mb-1 truncate">{topThree[2].name}</div>
                    <div className="text-xl font-bold text-primary-300">{topThree[2].totalScore} pts</div>
                    <div className="text-sm text-gray-400 truncate">{topThree[2].college}</div>
                  </div>
                  <div className="h-24 w-24 bg-dark-800 rounded-t-lg flex items-center justify-center border-t-2 border-l-2 border-r-2 border-gray-700">
                    <div className="text-4xl text-gray-300 font-bold flex items-center">
                      <Award className="h-8 w-8 text-gray-300 mr-1" />
                      3
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="glass-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-200 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name or college..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-md bg-dark-800 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-200 mb-1">
                  Event Category
                </label>
                <div className="relative">
                  <select
                    id="categoryFilter"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 rounded-md bg-dark-800 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    {EVENT_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-200 mb-1">
                  Participant Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setParticipantType('all')}
                    className={`flex-1 px-4 py-2 rounded-md flex justify-center items-center ${
                      participantType === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    All
                  </button>
                  <button
                    onClick={() => setParticipantType('individual')}
                    className={`flex-1 px-4 py-2 rounded-md flex justify-center items-center ${
                      participantType === 'individual'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Individual
                  </button>
                  <button
                    onClick={() => setParticipantType('team')}
                    className={`flex-1 px-4 py-2 rounded-md flex justify-center items-center ${
                      participantType === 'team'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {filteredParticipants.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-12">
              <Trophy className="h-16 w-16 text-gray-500 mb-4" />
              <p className="text-lg font-medium text-gray-300">No participants found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-800/50 text-left">
                    <th className="px-6 py-3 text-gray-200 font-medium text-center w-16">Rank</th>
                    <th className="px-6 py-3 text-gray-200 font-medium">Participant</th>
                    <th className="px-6 py-3 text-gray-200 font-medium hidden md:table-cell">College</th>
                    <th className="px-6 py-3 text-gray-200 font-medium hidden md:table-cell">Type</th>
                    <th className="px-6 py-3 text-gray-200 font-medium text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredParticipants.map((participant, index) => (
                    <tr 
                      key={participant.id} 
                      className={`${
                        index < 3 ? 'bg-dark-800/40' : 'odd:bg-dark-900/30 even:bg-dark-800/30'
                      } hover:bg-dark-700/40 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {participant.rank === 1 && (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-dark-900 font-bold text-sm">
                            1
                          </div>
                        )}
                        {participant.rank === 2 && (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-dark-900 font-bold text-sm">
                            2
                          </div>
                        )}
                        {participant.rank === 3 && (
                          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-dark-900 font-bold text-sm">
                            3
                          </div>
                        )}
                        {participant.rank && participant.rank > 3 && (
                          <span className="text-gray-400 font-medium">{participant.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            participant.type === 'individual' 
                              ? 'bg-primary-900/50 text-primary-500' 
                              : 'bg-secondary-900/50 text-secondary-500'
                          }`}>
                            {participant.type === 'individual' ? (
                              <User className="h-5 w-5" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-base font-medium text-white">{participant.name}</div>
                            {participant.type === 'team' && participant.teamMembers && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {participant.teamMembers.length} members
                              </div>
                            )}
                            <div className="md:hidden text-xs text-gray-400 mt-0.5">
                              {participant.college}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-300">{participant.college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          participant.type === 'individual'
                            ? 'bg-primary-900 text-primary-300'
                            : 'bg-secondary-900 text-secondary-300'
                        }`}>
                          {participant.type === 'individual' ? 'Individual' : 'Team'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-primary-400">
                          {participant.totalScore} pts
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;