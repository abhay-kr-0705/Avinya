import React from 'react';
import { Event } from '../types';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Date & Time</h3>
              <p className="text-gray-600">
                {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">Location</h3>
              <p className="text-gray-600">{event.location}</p>
            </div>

            {event.details && (
              <>
                {event.details.full_description && (
                  <div>
                    <h3 className="font-semibold text-lg">Full Description</h3>
                    <p className="text-gray-600">{event.details.full_description}</p>
                  </div>
                )}

                {event.details.winners && (
                  <div>
                    <h3 className="font-semibold text-lg">Winners</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {event.details.winners.map((winner: any, index: number) => (
                        <li key={index}>
                          {winner.position}: {winner.name} - {winner.project}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;