import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User as UserIcon, LogOut, Home, Info, Calendar, Users, Image, Award, FileText, Mail, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../utils/localStorage';
import logo from './logo.png';

interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = () => {
      const currentUser = user || getUser();
      if (currentUser) {
        const isAdminUser = currentUser.role === 'admin' || currentUser.role === 'superadmin';
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2";
    const activeClasses = "text-white bg-gradient-to-r from-primary-500 to-secondary-500 shadow-md";
    const inactiveClasses = "text-gray-600 hover:text-primary-600 hover:bg-gray-100/60";
    
    return `${baseClasses} ${isActivePath(path) ? activeClasses : inactiveClasses}`;
  };

  const handleLogout = () => {
    // Instead of using logout directly, we'll use localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    setShowUserMenu(false);
  };

  // Icons for navigation links
  const getNavIcon = (path: string) => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    
    switch (path) {
      case '/':
        return <Home {...iconProps} />;
      case '/about':
        return <Info {...iconProps} />;
      case '/events':
        return <Calendar {...iconProps} />;
      case '/team':
        return <Users {...iconProps} />;
      case '/gallery':
        return <Image {...iconProps} />;
      case '/leaderboard':
        return <Award {...iconProps} />;
      case '/resources':
        return <FileText {...iconProps} />;
      case '/contact':
        return <Mail {...iconProps} />;
      case '/admin':
        return <Settings {...iconProps} />;
      default:
        return null;
    }
  };

  const links = [
    { id: 1, link: '/', text: 'Home' },
    { id: 2, link: '/about', text: 'About' },
    { id: 3, link: '/events', text: 'Events' },
    { id: 4, link: '/team', text: 'Core-Team'},
    { id: 5, link: '/gallery', text: 'Gallery' },
    { id: 6, link: '/leaderboard', text: 'Leaderboard' },
    { id: 7, link: '/resources', text: 'Resources' },
    { id: 8, link: '/contact', text: 'Contact' },
    ...(isAdmin ? [{ id: 9, link: '/admin', text: 'Admin' }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'backdrop-blur-xl bg-white shadow-lg border-b border-gray-200/40' 
        : 'bg-white backdrop-blur-md'
    }`} style={{ height: 'var(--navbar-height)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 p-1 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <img src={logo} alt="Avinya Logo" className="h-8 w-auto" />
              </div>
              <div>
                <span className="font-bold text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300 group-hover:from-primary-600 group-hover:to-secondary-600">Avinya</span>
                <span className="hidden sm:inline-block ml-2 text-xl font-light text-gray-600"></span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {links.map(({ id, link, text }) => (
              <Link key={id} to={link} className={getLinkClasses(link)}>
                {getNavIcon(link)}
                <span>{text}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="relative ml-3">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-100/60 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md overflow-hidden">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                  </div>
                  <span className="hidden md:inline-block max-w-[120px] truncate">{user.name || user.email}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg glass-card ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-200/40 transform origin-top-right transition-all duration-200 scale-100 animate-fadeIn">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200/40 bg-gradient-to-r from-primary-50/80 to-secondary-50/80">
                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-100/60 hover:text-primary-600 transition-colors duration-200 flex items-center"
                      >
                        <UserIcon size={16} className="inline mr-3 text-primary-400" />
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100/60 hover:text-red-600 transition-colors duration-200 flex items-center"
                      >
                        <LogOut size={16} className="inline mr-3 text-primary-400" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {user && (
              <div className="mr-2">
                <Link to="/profile" className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                  </div>
                </Link>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100/60 transition-colors duration-200 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-xl bg-white border-t border-gray-200/40 animate-fadeIn shadow-lg" style={{ top: 'var(--navbar-height)' }}>
          <div className="flex flex-col space-y-1 px-4 pt-2 pb-4 max-h-[80vh] overflow-y-auto">
            {links.map(({ id, link, text }) => (
              <Link 
                key={id} 
                to={link} 
                className={`flex items-center ${getLinkClasses(link)}`}
              >
                {getNavIcon(link)}
                <span>{text}</span>
              </Link>
            ))}
            {user ? (
              <div className="border-t border-gray-200/40 mt-3 pt-3">
                <div className="flex items-center space-x-3 px-4 py-3 mb-2 glass-card rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{user.name || user.email}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-100/60 rounded-lg hover:text-primary-600 transition-colors duration-200 mb-1 flex items-center"
                >
                  <UserIcon size={18} className="mr-3 text-primary-500" />
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100/60 rounded-lg hover:text-red-600 transition-colors duration-200 flex items-center"
                >
                  <LogOut size={18} className="mr-3 text-primary-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="mt-3 px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;