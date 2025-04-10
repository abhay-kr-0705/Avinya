import React from 'react';
import { Code2, Smartphone, Brain, Bot, Wifi, Terminal, Shield, Palette, Users } from 'lucide-react';
import { Domain } from '../types';

const domains: Domain[] = [
  {
    name: 'Web Development',
    description: 'Building modern web applications using cutting-edge technologies.',
    icon: 'Code2',
    lead: {
      name: 'Prakhar Prasad',
      role: 'Lead'
    },
    colead: {
      name: 'Ankita kumari',
      role: 'Co-Lead'
    }
  },
  {
    name: 'App Development',
    description: 'Creating innovative mobile applications for various platforms.',
    icon: 'Smartphone',
    lead: {
      name: 'Abhishek Kumar Singh',
      role: 'Lead'
    },
    colead: {
      name: 'Ankit Upadhyay',
      role: 'Co-Lead'
    }
  },
  {
    name: 'AI & ML',
    description: 'Exploring artificial intelligence and machine learning technologies.',
    icon: 'Brain'
  },
  {
    name: 'Robotics & IoT',
    description: 'Building smart devices and robotic systems.',
    icon: 'Bot',
    lead: {
      name: 'Abhay Kumar',
      role: 'Lead'
    },
    colead: {
      name: 'Anjali Chauhan',
      role: 'Co-Lead'
    }
  },
  {
    name: 'Cybersecurity',
    description: 'Protecting digital assets and systems from cyber threats.',
    icon: 'Shield',
    lead: {
      name: 'Abhishek Kumar Jha',
      role: 'Lead'
    },
    colead: {
      name: 'Saurabh Kumar',
      role: 'Co-Lead'
    }
  },
  {
    name: 'Competitive Programming',
    description: 'Enhancing problem-solving and coding skills.',
    icon: 'Terminal',
    lead: {
      name: 'Devika Kumari',
      role: 'Lead'
    },
    colead: {
      name: 'Rakhee Kumari',
      role: 'Co-Lead'
    }
  },
  {
    name: 'Creativity',
    description: 'Fostering creative thinking and innovative solutions.',
    icon: 'Palette',
    lead: {
      name: 'Abhishek Kumar',
      role: 'Lead'
    },
    colead: {
      name: 'Braj Kumar',
      role: 'Co-Lead'
    }
  },
  {
    name: 'Outreach',
    description: 'Connecting with the community and spreading knowledge.',
    icon: 'Users',
    lead: {
      name: 'Abhiraj Kumar',
      role: 'Lead'
    },
    colead: {
      name: 'Suruchi Kumari',
      role: 'Co-Lead'
    }
  }
];

const DomainSlider = () => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      Code2, Smartphone, Brain, Bot, Wifi, Terminal, Shield, Palette, Users
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors duration-300" /> : null;
  };

  return (
    <div className="py-8 md:py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-3">
            Our Domains
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {domains.map((domain, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden w-full mx-auto"
            >
              {/* Gradient overlay that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-3 md:p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Icon with background circle */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-indigo-50 group-hover:bg-white/10 flex items-center justify-center mb-3 md:mb-4 transition-colors duration-300">
                    {getIcon(domain.icon)}
                  </div>
                  
                  {/* Domain name and description */}
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800 group-hover:text-white transition-colors duration-300">
                    {domain.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-100 mb-3 md:mb-4 transition-colors duration-300">
                    {domain.description}
                  </p>
                  
                  {/* Team members */}
                  <div className="space-y-0.5">
                    {domain.lead && (
                      <p className="text-xs md:text-sm font-medium text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
                        Lead: <span className="text-indigo-600 group-hover:text-white">{domain.lead.name}</span>
                      </p>
                    )}
                    {domain.colead && (
                      <p className="text-xs md:text-sm font-medium text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
                        Co-Lead: <span className="text-indigo-600 group-hover:text-white">{domain.colead.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainSlider;