import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/layout.css'; // Import our layout CSS

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  fullWidth?: boolean; // Option for full-width content
  className?: string; // Additional classes for the main content
  pageTitle?: string; // For accessibility and SEO
}

/**
 * Layout component that wraps all pages with consistent spacing and structure.
 * Ensures content doesn't overlap with the fixed navbar.
 */
const Layout: React.FC<LayoutProps> = ({ 
  children, 
  hideFooter = false, 
  fullWidth = false,
  className = '',
  pageTitle = 'Avinya - The Technical Fest'
}) => {
  // Update document title for SEO and accessibility
  useEffect(() => {
    document.title = pageTitle;
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [pageTitle]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <Navbar />
      
      {/* Main content with padding to avoid navbar overlap */}
      <main className={`flex-grow page-container ${className}`} id="main-content">
        {!fullWidth ? (
          <div className="content-container relative z-10">
            {children}
          </div>
        ) : (
          <div className="relative z-10">
            {children}
          </div>
        )}
        
        {/* Background decoration elements */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Top-right gradient blob */}
          <div 
            className="absolute -top-32 right-0 w-96 h-96 bg-gradient-to-b from-primary-100 to-primary-50 rounded-full filter blur-3xl opacity-30"
            style={{ transform: 'translate(30%, -20%)' }}
          ></div>
          
          {/* Bottom-left gradient blob */}
          <div 
            className="absolute -bottom-32 left-0 w-96 h-96 bg-gradient-to-t from-secondary-100 to-secondary-50 rounded-full filter blur-3xl opacity-30"
            style={{ transform: 'translate(-30%, 20%)' }}
          ></div>
          
          {/* Center-right gradient blob */}
          <div 
            className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-tl from-primary-200/40 to-secondary-200/40 rounded-full filter blur-3xl opacity-20"
            style={{ transform: 'translate(50%, -50%)' }}
          ></div>
          
          {/* Tech pattern grid */}
          <div className="absolute inset-0 bg-tech-pattern opacity-5"></div>
        </div>
      </main>
      
      {/* Optional Footer */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout; 