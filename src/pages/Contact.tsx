import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        formRef.current!,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      if (result.text === 'OK') {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again or email us directly.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Contact Us
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Get in Touch</h2>
            <p className="mb-6 text-gray-600">Have questions about GenX Developers Club or want to get involved? We'd love to hear from you!</p>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span><strong className="text-gray-800">Email:</strong> genx.gdc@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span><strong className="text-gray-800">Location:</strong> Sereshah Engineering College, Academic Building (Room No: 320)</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/genx_developers/profilecard/?igsh=eXRjaWllaHQ4eDM2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/company/genx-developers-group/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Find Us</h3>
              <div className="w-full rounded-lg overflow-hidden shadow-md">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25696.34787077699!2d83.95706153242958!3d25.058286673527476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398dadbac7c73027%3A0x3bc4c5745ba8e914!2sSershah%20Engineering%20College%2C%20Sasaram!5e0!3m2!1sen!2sin!4v1743461712582!5m2!1sen!2sin" 
                  width="100%" 
                  height="300" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sershah Engineering College, Sasaram"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Send Us a Message</h2>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transform hover:-translate-y-0.5 transition-all duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;