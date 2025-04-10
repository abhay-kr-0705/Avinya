import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authUser) {
      fetchProfile();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile
  };
}