import React from 'react';
import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  registrations: Set<string>;
  handleRegister?: (eventId: string) => Promise<void>;
}

const EventList: React.FC<EventListProps> = ({ events, registrations, handleRegister }) => {
  if (events.length === 0) {
    return (
      <div className="text-center text-gray-600">
        No events available at this time.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isRegistered={registrations.has(event.id)}
          onRegister={handleRegister}
        />
      ))}
    </div>
  );
};

export default EventList;