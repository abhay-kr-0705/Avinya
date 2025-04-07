import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Events from './pages/Events';
import EventRegistration from './pages/EventRegistration';
import Resources from './pages/Resources';
import Gallery from './pages/Gallery';
import GalleryView from './pages/GalleryView';
import Leaderboard from './pages/Leaderboard';
import Contact from './pages/Contact';
import About from './pages/About';
import Team from './pages/Team';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import ManageGallery from './pages/admin/ManageGallery';
import ManageResources from './pages/admin/ManageResources';
import EventRegistrations from './pages/admin/EventRegistrations';
import ManageLeaderboard from './pages/admin/ManageLeaderboard';

// User Pages
import UserProfile from './components/UserProfile';
import UserRegistrations from './pages/user/Registrations';

// Auth Context Provider
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen tech-background">
          <Toaster position="top-right" />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:galleryId" element={<GalleryView />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Signup />
                  </ProtectedRoute>
                } 
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-registrations" 
                element={
                  <ProtectedRoute>
                    <UserRegistrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/events/:eventId/register" 
                element={
                  <ProtectedRoute>
                    <EventRegistration />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute element={<Dashboard />} />} />
              <Route path="/admin/events" element={<AdminRoute element={<ManageEvents />} />} />
              <Route path="/admin/events/:eventId" element={<AdminRoute element={<EventRegistrations />} />} />
              <Route path="/admin/resources" element={<AdminRoute element={<ManageResources />} />} />
              <Route path="/admin/gallery" element={<AdminRoute element={<ManageGallery />} />} />
              <Route path="/admin/leaderboard" element={<AdminRoute element={<ManageLeaderboard />} />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;