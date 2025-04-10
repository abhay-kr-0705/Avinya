import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);

    try {
      if (!token) {
        throw new Error('Reset token is missing');
      }
      
      await resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successful!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      handleError(error, 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen tech-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">Invalid or missing reset token</div>
          <Link
            to="/forgot-password"
            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
          <p className="text-gray-300">
            Create a new strong password for your account
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-primary-900/30 text-primary-200 rounded-lg">
              <p>Your password has been reset successfully!</p>
              <p className="mt-2">You'll be redirected to the login page in a moment.</p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Confirm new password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full primary-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300">
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 