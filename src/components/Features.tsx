import React from 'react';
import { BookOpen, Trophy, Laptop, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Features = () => {
  const { user } = useAuth();
  
  const features = [
    {
      title: 'Mentorship',
      description: 'Work with experienced peers and mentors from various fields.',
      icon: BookOpen
    },
    {
      title: 'Projects & Competitions',
      description: 'Participate in exciting projects and competitions – hackathons, Ideathons, and more.',
      icon: Trophy
    },
    {
      title: 'Hands-on Workshops',
      description: 'Gain practical experience with our regular workshops and hands-on sessions.',
      icon: Laptop
    },
    {
      title: 'Community & Networking',
      description: 'Connect with like-minded tech enthusiasts and industry experts.',
      icon: Users
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {!user && (
          <div className="text-center mt-8">
            <Link
              to="/signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Join GENx Club Today
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;