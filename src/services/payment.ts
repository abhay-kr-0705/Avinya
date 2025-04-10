import api from './api';
import { toast } from 'react-hot-toast';

export const createPaymentOrder = async (
  eventId: string, 
  registrationId: string, 
  amount: number
) => {
  try {
    const response = await api.post('/payments/create-order', {
      eventId, 
      registrationId, 
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    toast.error('Failed to create payment order');
    throw error;
  }
};

export const updatePaymentStatus = async (
  eventId: string,
  registrationId: string,
  status: 'pending' | 'completed',
  paymentDetails?: any
) => {
  try {
    const response = await api.post('/payments/update-status', {
      eventId, 
      registrationId, 
      status,
      paymentDetails
    });
    toast.success('Payment status updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    toast.error('Failed to update payment status');
    throw error;
  }
}; 