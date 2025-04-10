import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import Abhay from './Abhay.png';
import Prakhar from './prakhar.jpg';
import Ankita from './Ankita.jpg';
import Anjali from './Anjali.jpg';
import Braj from './Braj.jpg';
import Devika from './devika.jpg';
import Rakhee from './Rakhee.jpg';
import Saurabh from './Saurabh.jpg';
import blank from './blank.jpg';
import Abhishek from './Abhishek.jpg';
import AbhishekK from './AbhishekBhaiya.jpg';
import Abhiraj from './Abhiraj.jpg';
import AbhishekKumarJha from './33 - Abhisekh kumar jha..jpg';
import AnkitUpadhyay from './Ankit.jpg';
import Niraj from './Niraj.png';
import Suruchi from './Suruchi.jpg';
import Mentor from './mentor.jpg';
import principal1 from './principal.jpg';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  github?: string;
  email?: string;
  instagram?: string;
}
const principal: TeamMember = {
  id: 1,
  name: 'Mr. Manish Kumar',
  role: 'Principal, SEC Sasaram',
  image: principal1,
};

const mentor: TeamMember = {
  id: 2,
  name: 'Mr. Om Prakash',
  role: 'SPOC, GenX',
  image: Mentor,
};

const founder: TeamMember = {
  id: 3,
  name: 'Niraj Kumar',
  role: 'Founder, GenX',
  image: Niraj,
  instagram: 'https://www.instagram.com/avinash.vats_?igsh=MW4yZGpyZzFnYjBwag%3D%3D',
  linkedin: 'https://www.linkedin.com/in/niraj-vats/'
};

const leaders: TeamMember[] = [
  {
    id: 4,
    name: 'Abhay Kumar',
    role: 'Leader',
    image: Abhay,
    instagram: 'https://instagram.com/abhay_kr.0705/',
    linkedin: 'https://linkedin.com/in/abhay-kumar-81b2a8288/'
  },
  {
    id: 5,
    name: 'Abhiraj Kumar',
    role: 'Co-Leader',
    image: Abhiraj,
    instagram: 'https://instagram.com/abhiraj23',
    linkedin: 'https://linkedin.com/in/abhiraj23'
  }
];

const domainLeads: TeamMember[] = [
  {
    id: 6,
    name: 'Abhay Kumar',
    role: 'Robotics & IoT Lead',
    image: Abhay,
    instagram: 'https://www.instagram.com/abhay_kr.0705/',
    linkedin: 'https://www.linkedin.com/in/abhay-kumar-81b2a8288/'
  },
  {
    id: 7,
    name: 'Devika Kumari',
    role: 'Competitive Programming Lead',
    image: Devika,
    instagram: 'https://www.instagram.com/devikka_kummari/',
    linkedin: 'https://www.linkedin.com/in/devika-kumari-1bb2a22a6?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 8,
    name: 'Abhishek Kumar',
    role: 'Creativity Lead',
    image: AbhishekK,
    instagram: 'https://www.instagram.com/_abhii__shek_?igsh=ZWhjMGxxZ3A0NmJ4',
    linkedin: 'https://www.linkedin.com/in/abhishek-kumar-4ba2801a7?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 9,
    name: 'Abhiraj Kumar',
    role: 'Outreach Lead',
    image: Abhiraj,
    instagram: 'https://www.instagram.com/instabhiraj/profilecard/?igsh=aHB6dGthYzN5ZXRv',
    linkedin: 'https://www.linkedin.com/in/abhiraj23'
  },
  {
    id: 10,
    name: 'Prakhar Prasad',
    role: 'Web Development Lead',
    image: Prakhar,
    instagram: 'https://www.instagram.com/prakharprasad4?igsh=MTgyYjNuMHgwdTJxcA==',
    linkedin: 'https://www.linkedin.com/in/prakhar-prasad-0887b5343?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 11,
    name: 'Abhishek Singh',
    role: 'App Development Lead',
    image: Abhishek,
    instagram: 'https://instagram.com/abhis..........0hek',
    linkedin: 'https://www.linkedin.com/in/abhisheksinghexpert'
  },
  {
    id: 12,
    name: 'Abhishek Kumar Jha',
    role: 'Cybersecurity Lead',
    image: AbhishekKumarJha,
    instagram: 'https://www.instagram.com/abhisekhkumar__?igsh=ODJmOWx6MXV3cTc4',
    linkedin: 'https://www.linkedin.com/in/abhisekh-kumar-jha-816407329?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 13,
    name: '..........',
    role: 'AI ML Lead',
    image: blank,
    instagram: 'https://instagram.com/supri.....ya',
    linkedin: 'https://linkedin.com/in/supr.....iya'
  },
];

const domainCoLeads: TeamMember[] = [
  
  {
    id: 14,
    name: 'Ankit Upadhyay',
    role: 'App Development Co-Lead',
    image: AnkitUpadhyay,
    instagram: 'https://instagram.com/',
    linkedin: 'https://www.linkedin.com/in/ankit-upadhyay-083058287?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 15,
    name: 'Suruchi Kumari',
    role: 'Outreach Co-Lead',
    image: Suruchi,
    instagram: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=tf01d2uig_contact_invite&utm_medium=copy_link&utm_content=tf01d2u',
    linkedin: 'https://www.linkedin.com/in/suruchi2023'
  },
  {
    id: 16,
    name: 'Anjali Chauhan',
    role: 'Robotics & IoT Co-Lead',
    image: Anjali,
    instagram: 'https://instagram.com/a......0njali',
    linkedin: 'https://www.linkedin.com/in/anjali-c-637619331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 17,
    name: 'Rakhee Kumari',
    role: 'Competitive Programming Co-Lead',
    image: Rakhee,
    instagram: 'https://instagram.com/rakhee..0.0.0',
    linkedin: 'https://www.linkedin.com/in/rakhee-768943281?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  {
    id: 18,
    name: 'Braj Kumar',
    role: 'Creativity Co-Lead',
    image: Braj,
    instagram: 'https://www.instagram.com/braj.here',
    linkedin: 'https://www.linkedin.com/in/abbraj'
  },
  {
    id: 19,
    name: 'Saurabh Kumar',
    role: 'Cybersecurity Co-Lead',
    image: Saurabh,
    instagram: 'https://www.instagram.com/_hmm.saurabh?igsh=aWxhejhubnBpb2h1',
    linkedin: 'https://www.linkedin.com/in/saurabh-kumar-b85597322?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
  },
  
  {
    id: 20,
    name: 'Ankita kumari',
    role: 'Web Development Co-Lead',
    image: Ankita,
    instagram: 'https://instagram.com/....',
    linkedin: 'https://linkedin.com/in/....'
  },
  {
    id: 21,
    name: '..........',
    role: 'AI ML Co-Lead',
    image: blank,
    instagram: 'https://instagram.com/supri......0ya',
    linkedin: 'https://linkedin.com/in/supri.0...0ya'
  }
];

const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl bg-gradient-to-b from-dark-800 to-dark-900 border border-dark-700 group-hover:border-primary-500/30 h-full">
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent z-10"></div>
          <img 
            src={member.image} 
            alt={member.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = blank;
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <div className="flex space-x-4">
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white bg-[#0A66C2] p-2 rounded-full hover:bg-opacity-90 transition-all">
                  <FaLinkedin className="w-5 h-5" />
                </a>
              )}
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-white bg-[#333] p-2 rounded-full hover:bg-opacity-90 transition-all">
                  <FaGithub className="w-5 h-5" />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} className="text-white bg-primary-600 p-2 rounded-full hover:bg-opacity-90 transition-all">
                  <FaEnvelope className="w-5 h-5" />
                </a>
              )}
              {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-white bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] p-2 rounded-full hover:bg-opacity-90 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-primary-400 mb-3">
            {member.role}
          </p>
          
          <div className="flex space-x-2 md:hidden mt-2">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#0A66C2] transition-colors">
                <FaLinkedin className="w-4 h-4" />
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <FaGithub className="w-4 h-4" />
              </a>
            )}
            {member.email && (
              <a href={`mailto:${member.email}`} className="text-white hover:text-primary-400 transition-colors">
                <FaEnvelope className="w-4 h-4" />
              </a>
            )}
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="mb-12 relative">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center relative z-10">
        <span className="relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></span>
        </span>
      </h2>
    </div>
  );
};

const Team = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-dark-950 to-dark-900">
      <div className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/10 rounded-full filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 leading-tight">
              Our Core Team
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Meet the innovative minds behind Avinya - individuals who are passionate about technology and committed to creating an exceptional technical fest experience.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-24">
          <SectionTitle title="Leadership" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <TeamMemberCard member={principal} />
            <TeamMemberCard member={mentor} />
          </div>
        </div>

        <div className="mb-24">
          <SectionTitle title="Founder" />
          <div className="max-w-sm mx-auto">
            <TeamMemberCard member={founder} />
          </div>
        </div>

        <div className="mb-24">
          <SectionTitle title="Team Leaders" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            {leaders.map(leader => (
              <TeamMemberCard key={leader.id} member={leader} />
            ))}
          </div>
        </div>

        <div className="mb-24">
          <SectionTitle title="Domain Leads" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {domainLeads.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        <div className="mb-20">
          <SectionTitle title="Domain Co-Leads" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {domainCoLeads.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;