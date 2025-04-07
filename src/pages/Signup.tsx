import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Updated list of colleges as specified
const collegeOptions = [
  "Select your college",
  "IIIT Bhagalpur (Indian Institute of Information Technology, Bhagalpur)",
  "Netaji Subhas Institute of Technology, Patna",
  "Muzaffarpur Institute of Technology, Muzaffarpur",
  "Bhagalpur College of Engineering, Bhagalpur",
  "Darbhanga College of Engineering, Darbhanga",
  "Nalanda College of Engineering, Chandi, Nalanda",
  "Gaya College of Engineering, Gaya",
  "Sershah Engineering College, Sasaram",
  "Moti Babu Institute of Technology, Forbesganj",
  "Purnea College of Engineering, Purnea",
  "Saharsa College of Engineering, Saharsa",
  "Siwan Engineering & Technical Institute, Siwan",
  "Government Engineering College, Jamui",
  "Government Engineering College, Banka",
  "Government Engineering College, Vaishali",
  "Government Engineering College, Nawada",
  "Government Engineering College, Kishanganj",
  "Government Engineering College, Munger",
  "Government Engineering College, Sheohar",
  "Government Engineering College, Lakhisarai",
  "Government Engineering College, Samastipur",
  "Government Engineering College, Sheikhpura",
  "Government Engineering College, Siwan",
  "Government Engineering College, Aurangabad",
  "Government Engineering College, Kaimur",
  "Government Engineering College, Gopalganj",
  "Government Engineering College, Araria",
  "Other"
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registration_no: '',
    branch: '',
    semester: '',
    mobile: '',
    countryCode: '+91', // Set default to +91
    college: 'Select your college', // Updated default value
    otherCollege: '', // For "Other" option
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.college === 'Select your college') {
      toast.error('Please select your college');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Determine the college value to send
    const collegeValue = formData.college === 'Other' ? formData.otherCollege : formData.college;

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.registration_no,
        formData.branch,
        formData.semester,
        formData.countryCode + formData.mobile,
        collegeValue // Add college to registration
      );
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center tech-background py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="max-w-md w-full space-y-8 glass-card shadow-xl border border-gray-100/50 rounded-2xl backdrop-blur-sm">
        <div className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-primary-200/60 to-secondary-200/60 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-primary-200/60 to-secondary-200/60 rounded-full blur-xl"></div>
          <h2 className="text-center text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Create an Account
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            Join GenX Developers Club and start your journey
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto mt-5 rounded-full shadow-sm"></div>
        </div>
        <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Full Name Input with improved UI */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input with improved UI */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* College Selection with updated colleges list */}
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                Select your college
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select
                  id="college"
                  name="college"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                  value={formData.college}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {collegeOptions.map((college, index) => (
                    <option key={index} value={college} disabled={college === "Select your college" && index === 0}>
                      {college}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Other College Input - conditionally rendered with improved UI */}
            {formData.college === 'Other' && (
              <div>
                <label htmlFor="otherCollege" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your college name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    id="otherCollege"
                    name="otherCollege"
                    type="text"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your college name"
                    value={formData.otherCollege}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Registration Number with improved UI */}
            <div>
              <label htmlFor="registration_no" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input
                  id="registration_no"
                  name="registration_no"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your registration number"
                  value={formData.registration_no}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Branch Selection with improved UI */}
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <select
                  id="branch"
                  name="branch"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select your branch</option>
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="EEE">Electrical & Electronics Engineering</option>
                  <option value="ECE (VLSI)">Electronics & Communication (VLSI)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Mining">Mining Engineering</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Semester Selection with improved UI */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  id="semester"
                  name="semester"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  value={formData.semester}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select your semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobile Number with improved UI */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="relative w-24">
                  <select
                    name="countryCode"
                    className="appearance-none rounded-lg relative block w-full pl-3 pr-8 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                    value={formData.countryCode}
                    onChange={handleChange}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Password with improved UI */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password with improved UI */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-white/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;