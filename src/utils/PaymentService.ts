import { RAZORPAY_CONFIG } from '../config/razorpay';
import { updatePaymentStatus } from '../services/api';
import { handleError } from './errorHandling';

// Define interfaces
interface PaymentOptions {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  image?: string;
  orderId: string;
  eventId: string;
  registrationId: string;
  email: string;
  contact: string;
  callback_url?: string;
  redirect: boolean;
  notes?: Record<string, string>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export class PaymentService {
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        alert('Razorpay SDK failed to load. Check your internet connection.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  public async initiatePayment(options: PaymentOptions): Promise<boolean> {
    const {
      amount,
      currency = RAZORPAY_CONFIG.CURRENCY,
      name = RAZORPAY_CONFIG.COMPANY_NAME,
      description = RAZORPAY_CONFIG.COMPANY_DESCRIPTION,
      image = RAZORPAY_CONFIG.COMPANY_LOGO,
      orderId,
      eventId,
      registrationId,
      email,
      contact,
      redirect = false,
      notes = {}
    } = options;

    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded) return false;

    const paymentOptions = {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: amount * 100, // Convert to smallest currency unit (paise)
      currency,
      name,
      description,
      image,
      order_id: orderId,
      handler: async (response: any) => {
        try {
          // Handle success - update payment status in backend
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          };
          
          await updatePaymentStatus(eventId, registrationId, 'completed', paymentData);
          
          if (redirect) {
            window.location.href = '/my-registrations';
          } else {
            alert('Payment successful!');
            window.location.reload();
          }
        } catch (error) {
          handleError(error, 'Payment verification failed');
        }
      },
      prefill: {
        email,
        contact
      },
      notes,
      theme: {
        color: '#3949AB'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment dismissed');
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(paymentOptions);
      razorpay.open();
      return true;
    } catch (error) {
      handleError(error, 'Failed to initialize payment');
      return false;
    }
  }
}

export default new PaymentService(); 