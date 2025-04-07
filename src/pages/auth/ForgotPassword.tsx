import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      handleError(error, 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen tech-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-gray-300">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-primary-900/30 text-primary-200 rounded-lg">
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p className="mt-2">Please check your email and follow the instructions to reset your password.</p>
            </div>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full primary-button ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword; 