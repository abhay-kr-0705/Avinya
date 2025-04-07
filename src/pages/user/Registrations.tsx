import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserRegistrations, createPaymentOrder } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { handleError } from '../../utils/errorHandling';
import { CalendarIcon, MapPin, Clock, DollarSign } from 'lucide-react';
import PaymentService from '../../utils/PaymentService';
import toast from 'react-hot-toast';

interface Registration {
  id: string;
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    end_date: string;
    venue: string;
    type: 'upcoming' | 'past';
    eventType?: 'individual' | 'group';
    fee?: number;
  };
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  teamName?: string;
  members?: Array<{
    name: string;
    email: string;
    registration_no: string;
    college: string;
  }>;
  payment_status?: 'pending' | 'completed';
}

const UserRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchRegistrations(user.email);
    }
  }, [user]);

  const fetchRegistrations = async (email: string) => {
    try {
      setLoading(true);
      const data = await getUserRegistrations(email);
      setRegistrations(data);
    } catch (error) {
      handleError(error, 'Failed to fetch your registrations');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateTotalFee = (registration: Registration) => {
    if (!registration.event.fee) return 0;
    
    if (registration.members && registration.members.length > 0) {
      return registration.event.fee * (registration.members.length + 1); // Including team leader
    } else {
      return registration.event.fee;
    }
  };

  const handlePayment = async (registration: Registration) => {
    if (!user) {
      toast.error('You must be logged in to make a payment');
      return;
    }
    
    try {
      setProcessingPayment(registration.id);
      
      // Calculate the total fee for this registration
      const amount = calculateTotalFee(registration);
      
      // Create a payment order on the server
      const orderData = await createPaymentOrder(
        registration.event.id,
        registration.id,
        amount
      );
      
      // Initiate Razorpay payment
      await PaymentService.initiatePayment({
        amount,
        name: registration.event.title,
        description: `Registration for ${registration.event.title}`,
        orderId: orderData.id,
        eventId: registration.event.id,
        registrationId: registration.id,
        email: user.email,
        contact: user.mobile || '',
        redirect: true,
      });
    } catch (error) {
      handleError(error, 'Failed to initiate payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tech-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-8">My Registrations</h1>

          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-300 mb-4">You haven't registered for any events yet.</p>
              <Link to="/events" className="primary-button inline-block">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {registrations.map((registration) => (
                <div key={registration.id} className="bg-dark-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{registration.event.title}</h3>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          registration.status === 'confirmed' 
                            ? 'bg-green-900 text-green-300' 
                            : registration.status === 'rejected'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                        
                        {registration.payment_status && (
                          <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            registration.payment_status === 'completed' 
                              ? 'bg-primary-900 text-primary-300' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            Payment: {registration.payment_status}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-300 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-primary-400" />
                        <span>{formatDate(registration.event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-primary-400" />
                        <span>{registration.event.venue}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-primary-400" />
                        <span>Registered on {formatDate(registration.created_at)}</span>
                      </div>
                    </div>
                    
                    {registration.teamName && (
                      <div className="mb-4">
                        <p className="font-semibold text-gray-200">Team: {registration.teamName}</p>
                        {registration.members && registration.members.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-400 mb-1">Team Members:</p>
                            <ul className="list-disc list-inside text-sm text-gray-300 pl-2">
                              {registration.members.map((member, index) => (
                                <li key={index}>{member.name} ({member.college})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {registration.event.fee && (
                      <div className="flex items-center text-sm text-gray-300 mb-4">
                        <DollarSign className="h-4 w-4 mr-1 text-primary-400" />
                        <span>
                          Registration Fee: ₹{registration.event.fee}
                          {registration.members 
                            ? ` × ${registration.members.length + 1} = ₹${calculateTotalFee(registration)}`
                            : ''}
                        </span>
                      </div>
                    )}
                    
                    {registration.payment_status === 'pending' && registration.event.fee && (
                      <button 
                        className={`primary-button ${processingPayment === registration.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => handlePayment(registration)}
                        disabled={processingPayment === registration.id}
                      >
                        {processingPayment === registration.id ? 'Processing...' : 'Complete Payment'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRegistrations; 