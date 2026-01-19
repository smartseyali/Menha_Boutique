"use client"
import React, { useState } from 'react';
import RazorpayButton from './RazorpayButton';
import PhonePeButton from './PhonePeButton';

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: (gateway: string, response: any) => void;
  onPaymentError?: (gateway: string, error: Error) => void;
  selectedMethod?: string;
  onMethodChange?: (method: string) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  orderId,
  amount,
  currency = 'INR',
  onPaymentSuccess,
  onPaymentError,
  selectedMethod = 'cod',
  onMethodChange,
}) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod);
  const [mobileNumber, setMobileNumber] = useState('');

  const handleMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (onMethodChange) {
      onMethodChange(method);
    }
  };

  const handlePaymentSuccess = (gateway: string, response: any) => {
    onPaymentSuccess(gateway, response);
  };

  const handlePaymentError = (gateway: string, error: Error) => {
    if (onPaymentError) {
      onPaymentError(gateway, error);
    }
  };

  return (
    <div className="payment-gateway">
      <div className="sub-title">
        <h4>Payment Method</h4>
      </div>
      <div className="checkout-method">
        <span className="details">Please select your preferred payment method.</span>
        <div className="bb-del-option">
          <div className="inner-del">
            <div className="radio-itens">
              <input
                type="radio"
                id="payment-razorpay"
                name="payment-method"
                checked={paymentMethod === 'razorpay'}
                onChange={() => handleMethodChange('razorpay')}
              />
              <label htmlFor="payment-razorpay">Razorpay</label>
            </div>
          </div>
          <div className="inner-del">
            <div className="radio-itens">
              <input
                type="radio"
                id="payment-phonepe"
                name="payment-method"
                checked={paymentMethod === 'phonepe'}
                onChange={() => handleMethodChange('phonepe')}
              />
              <label htmlFor="payment-phonepe">PhonePe</label>
            </div>
          </div>
          <div className="inner-del">
            <div className="radio-itens">
              <input
                type="radio"
                id="payment-cod"
                name="payment-method"
                checked={paymentMethod === 'cod'}
                onChange={() => handleMethodChange('cod')}
              />
              <label htmlFor="payment-cod">Cash On Delivery</label>
            </div>
          </div>
        </div>

        {paymentMethod === 'razorpay' && (
          <div style={{ marginTop: '20px' }}>
            <RazorpayButton
              orderId={orderId}
              amount={amount}
              currency={currency}
              onSuccess={(response) => handlePaymentSuccess('razorpay', response)}
              onError={(error) => handlePaymentError('razorpay', error)}
            />
          </div>
        )}

        {paymentMethod === 'phonepe' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="phonepe-mobile" style={{ display: 'block', marginBottom: '5px' }}>
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                id="phonepe-mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
                style={{ padding: '8px', width: '100%', maxWidth: '300px' }}
              />
            </div>
            <PhonePeButton
              orderId={orderId}
              amount={amount}
              currency={currency}
              mobileNumber={mobileNumber}
              onSuccess={(response) => handlePaymentSuccess('phonepe', response)}
              onError={(error) => handlePaymentError('phonepe', error)}
            />
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
            <p>You will pay when the order is delivered.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;

