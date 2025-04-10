import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { updateProfile as apiUpdateProfile, changePassword as apiChangePassword } from '../services/api';
import { User, Settings, Key, LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registration_no: '',
    branch: '',
    semester: '',
    mobile: '',
    role: ''
  });
  const navigate = useNavigate();
  
  const { loading: authLoading } = useAuthRedirect(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        registration_no: user.registration_no || '',
        branch: user.branch || '',
        semester: user.semester || '',
        mobile: user.mobile || '',
        role: user.role || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { email, role, ...updateData } = formData;
      const updatedData = await apiUpdateProfile(updateData);
      await updateProfile(updatedData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      await apiChangePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-3 rounded-full">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{formData.name}</h1>
                  <p className="text-blue-100">{formData.email}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      disabled={submitting}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      disabled={submitting}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  disabled={submitting}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {showChangePassword ? (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      disabled={submitting}
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isEditing || submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registration_no}
                    onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isEditing || submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isEditing || submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isEditing || submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!isEditing || submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>

                {isEditing && (
                  <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      disabled={submitting}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;