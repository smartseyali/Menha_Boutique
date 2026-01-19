"use client"
import React, { useState } from 'react';
import { initiateRazorpayPayment, getPaymentCallbackUrl } from '@/utils/payment';
import { paymentApi } from '@/utils/api';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';

interface RazorpayButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess: (response: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  orderId,
  amount,
  currency = 'INR',
  onSuccess,
  onError,
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment order on backend
      const paymentOrder = await paymentApi.createOrder({
        orderId,
        gateway: 'razorpay',
        amount,
        currency,
        callbackUrl: getPaymentCallbackUrl('razorpay'),
      });

      if (!paymentOrder || !paymentOrder.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Get user info from localStorage for prefill
      const loginUser = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('login_user') || '{}')
        : {};

      // Initialize Razorpay payment
      await initiateRazorpayPayment({
        orderId: paymentOrder.orderId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        keyId: paymentOrder.keyId,
        name: 'Pattikadai',
        description: `Order Payment for Order #${orderId}`,
        prefill: {
          email: loginUser.email || '',
          contact: loginUser.phoneNumber || '',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationResult = await paymentApi.verifyPayment({
              orderId,
              gateway: 'razorpay',
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verificationResult.success) {
              showSuccessToast('Payment successful!');
              onSuccess(response);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            showErrorToast(error.message || 'Payment verification failed');
            if (onError) {
              onError(error);
            }
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showErrorToast('Payment cancelled');
          },
        },
      });

      setLoading(false);
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      setLoading(false);
      showErrorToast(error.message || 'Failed to initialize payment');
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className || 'bb-btn-2'}
      style={{ opacity: disabled || loading ? 0.6 : 1, cursor: disabled || loading ? 'not-allowed' : 'pointer' }}
    >
      {loading ? 'Processing...' : 'Pay with Razorpay'}
    </button>
  );
};

export default RazorpayButton;

