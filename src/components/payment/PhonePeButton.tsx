"use client"
import React, { useState } from 'react';
import { paymentApi } from '@/utils/api';
import { getPaymentCallbackUrl } from '@/utils/payment';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';

interface PhonePeButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess: (response: any) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  mobileNumber?: string;
}

const PhonePeButton: React.FC<PhonePeButtonProps> = ({
  orderId,
  amount,
  currency = 'INR',
  onSuccess,
  onError,
  disabled = false,
  className = '',
  mobileNumber = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment order on backend
      const paymentOrder = await paymentApi.createOrder({
        orderId,
        gateway: 'phonepe',
        amount,
        currency,
        callbackUrl: getPaymentCallbackUrl('phonepe'),
        mobileNumber,
      });

      if (!paymentOrder || !paymentOrder.redirectUrl) {
        throw new Error('Failed to create payment order');
      }

      // Redirect to PhonePe payment page
      window.location.href = paymentOrder.redirectUrl;
    } catch (error: any) {
      console.error('PhonePe payment error:', error);
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
      {loading ? 'Processing...' : 'Pay with PhonePe'}
    </button>
  );
};

export default PhonePeButton;

