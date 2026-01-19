// Payment utility functions

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 */
export const initiateRazorpayPayment = async (
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    name?: string;
    description?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    handler: (response: any) => void;
    modal?: {
      ondismiss?: () => void;
    };
  }
): Promise<void> => {
  await loadRazorpayScript();

  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: orderData.name || 'Pattikadai',
    description: orderData.description || 'Order Payment',
    order_id: orderData.orderId,
    handler: orderData.handler,
    prefill: orderData.prefill || {},
    theme: {
      color: '#3399cc',
    },
    modal: {
      ondismiss: orderData.modal?.ondismiss || (() => {}),
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

/**
 * Get callback URL for payment
 */
export const getPaymentCallbackUrl = (gateway: string, baseUrl?: string): string => {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${url}/payment/success?gateway=${gateway}`;
};

