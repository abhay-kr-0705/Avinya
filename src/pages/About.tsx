import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DomainSlider from '../components/DomainSlider';
import Footer from '../components/Footer';
import Layout from '../components/Layout';

const About = () => {
  const { user } = useAuth();

  return (
    <Layout pageTitle="About Avinya - The Technical Fest">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 leading-tight">
              About Avinya - The Technical Fest
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
              Welcome to Avinya 2025, the premier technical fest of Sher Shah Engineering College, where innovation, creativity, and technology converge! This fest is a celebration of knowledge, competition, and hands-on learning, bringing together the brightest minds from Bihar.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="glass-card p-8 border-l-4 border-primary-500 transform transition-all duration-300 hover:-translate-y-1 bg-white shadow-lg">
                <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Why Avinya?
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  "Avinya" signifies innovation and creation, and that's exactly what we aim to foster. Whether you're a passionate coder, a tech enthusiast, a robotics expert, or a creative problem solver, Avinya has something for you!
                </p>
              </div>
              
              <div className="glass-card p-8 border-l-4 border-secondary-500 transform transition-all duration-300 hover:-translate-y-1 bg-white shadow-lg">
                <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  What to Expect?
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Tech Competitions – From hackathons to coding battles, showcase your skills.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Workshops & Seminars – Learn from industry experts and enhance your expertise.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Robotics Challenges – Witness cutting-edge automation in action.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Gaming & Fun Events – Take a break and enjoy thrilling gaming experiences.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    <span>Networking Opportunities – Connect with like-minded innovators and professionals.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-8 border-l-4 border-primary-500 transform transition-all duration-300 hover:-translate-y-1 bg-white shadow-lg">
                <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Who Can Participate?
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Avinya is open to all tech enthusiasts, students, and professionals who are eager to compete, learn, and grow in the world of technology.
                  Be part of Avinya 2025 and embark on a journey of knowledge, excitement, and endless possibilities!
                </p>
                <div className="mt-6 space-y-2">
                  <p className="flex items-center text-gray-800">
                    <span className="font-bold text-primary-600 mr-2">📍 Venue:</span>
                    <span>Sher Shah Engineering College, Sasaram</span>
                  </p>
                  <p className="flex items-center text-gray-800">
                    <span className="font-bold text-primary-600 mr-2">📅 Date:</span>
                    <span>21 April to 25 April 2025</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Join the Innovation Revolution</h2>
            <p className="text-lg text-gray-700">Be a part of Bihar's biggest technical festival and showcase your talent</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mt-6"></div>
          </div>
          
          {!user && (
            <div className="text-center mt-8">
              <a 
                href="/signup" 
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg shadow-lg hover:from-primary-700 hover:to-secondary-700 transform hover:-translate-y-1 transition-all duration-300"
              >
                Register Now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Domain Slider Section */}
     
    </Layout>
  );
};

export default About;