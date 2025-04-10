import { useState, useEffect } from 'react';
import { getEvents, getUserRegistrations } from '../services/api';
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const registrations = await getUserRegistrations();
      const registeredEventIds = new Set(registrations.map((reg: any) => reg.event._id));
      setRegistrations(registeredEventIds);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => new Date(event.start_date) > now);
  };

  const getPastEvents = () => {
    const now = new Date();
    return events.filter(event => new Date(event.start_date) <= now);
  };

  return {
    events,
    registrations,
    loading,
    error,
    getUpcomingEvents,
    getPastEvents,
    refetch: fetchEvents
  };
};