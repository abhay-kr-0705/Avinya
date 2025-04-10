import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = (requireAuth: boolean = true) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading and authentication is required
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/login', { replace: true });
      } else if (!requireAuth && user) {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, requireAuth, navigate]);

  return { user, loading };
};