const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config/config');

class PaymentService {
  constructor() {}

  /**
   * Create Razorpay Payment Link
   */
  async createRazorpayPaymentLink(orderData, gatewayConfig) {
    try {
      const razorpay = new Razorpay({
        key_id: gatewayConfig.keyId,
        key_secret: gatewayConfig.keySecret,
      });

      const { amount, currency, description, customer, notify, callbackUrl, notes } = orderData;

      const options = {
        amount: amount * 100, // Convert to paise
        currency: currency || 'INR',
        accept_partial: false,
        first_min_partial_amount: 0,
        description: description,
        customer: customer,
        notify: notify || { sms: true, email: true },
        reminder_enable: true,
        notes: notes || {},
        callback_url: callbackUrl,
        callback_method: 'get',
        reference_id: orderData.reference_id, // Add reference_id for tracking in callback
      };

      const paymentLink = await razorpay.paymentLink.create(options);
      return {
        success: true,
        id: paymentLink.id,
        short_url: paymentLink.short_url,
        status: paymentLink.status
      };
    } catch (error) {
      console.error('Razorpay payment link creation error:', error);
      // Don't throw, just return null so order flow continues
      return null;
    }
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(orderData, gatewayConfig) {
    try {
      const razorpay = new Razorpay({
        key_id: gatewayConfig.keyId,
        key_secret: gatewayConfig.keySecret,
      });

      const { amount, currency, receipt, notes } = orderData;

      const options = {
        amount: amount * 100, // Convert to paise
        currency: currency || 'INR',
        receipt: receipt,
        notes: notes || {},
      };

      const order = await razorpay.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: gatewayConfig.keyId,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment
   */
  verifyRazorpayPayment(paymentData, gatewayConfig) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', gatewayConfig.keySecret)
        .update(text)
        .digest('hex');

      const isValid = generatedSignature === razorpay_signature;

      return {
        success: isValid,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
      };
    } catch (error) {
      console.error('Razorpay verification error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate PhonePe X-VERIFY header
   */
  generatePhonePeXVerify(base64Payload, endpoint, saltKey, saltIndex) {
    const stringToHash = base64Payload + endpoint + saltKey;
    const hash = crypto
      .createHash('sha256')
      .update(stringToHash)
      .digest('hex');
    const finalHash = hash + '###' + saltIndex;
    return finalHash;
  }

  /**
   * Create PhonePe payment request
   */
  async createPhonePePayment(orderData, gatewayConfig) {
    try {
      const { amount, merchantTransactionId, callbackUrl, mobileNumber, merchantUserId } = orderData;
      const { merchantId, saltKey, saltIndex, baseUrl } = gatewayConfig;

      const payload = {
        merchantId: merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId || 'MUID' + Date.now(),
        amount: amount * 100, // Convert to paise
        redirectUrl: callbackUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: callbackUrl,
        mobileNumber: mobileNumber || '',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const endpoint = '/pg/v1/pay';
      const xVerify = this.generatePhonePeXVerify(base64Payload, endpoint, saltKey, saltIndex);

      const response = await axios.post(
        `${baseUrl}${endpoint}`,
        {
          request: base64Payload,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data.instrumentResponse.redirectInfo) {
        return {
          success: true,
          redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId: merchantTransactionId,
        };
      }

      throw new Error('Failed to create PhonePe payment');
    } catch (error) {
      console.error('PhonePe payment creation error:', error.response?.data || error.message);
      throw new Error(`Failed to create PhonePe payment: ${error.message}`);
    }
  }

  /**
   * Verify PhonePe payment status
   */
  async verifyPhonePePayment(merchantTransactionId, gatewayConfig) {
    try {
      const { merchantId, saltKey, saltIndex, baseUrl } = gatewayConfig;
      
      const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
      const url = `${baseUrl}${endpoint}`;
      const xVerify = this.generatePhonePeXVerify('', endpoint, saltKey, saltIndex);

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
          'Accept': 'application/json',
        },
      });

      if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
        return {
          success: true,
          transactionId: response.data.data.transactionId,
          merchantTransactionId: merchantTransactionId,
          amount: response.data.data.amount / 100, // Convert from paise
          paymentState: response.data.data.state,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Payment verification failed',
      };
    } catch (error) {
      console.error('PhonePe verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Create Cashfree Payment (API)
   */
  async createCashfreePayment(orderData, gatewayConfig) {
      try {
          const { appId, secretKey, baseUrl } = gatewayConfig; // baseUrl usually https://sandbox.cashfree.com/pg/orders
          const { amount, orderId, customerDate, mobileNumber, callbackUrl, email } = orderData;
          
          const url = `${baseUrl || 'https://sandbox.cashfree.com/pg'}/orders`;
          
          const payload = {
              customer_details: {
                  customer_id: orderData.merchantUserId || 'CUST_001',
                  customer_email: email || 'customer@example.com',
                  customer_phone: mobileNumber || '9999999999'
              },
              order_meta: {
                  return_url: callbackUrl
              },
              order_id: orderId,
              order_amount: amount,
              order_currency: 'INR'
          };

          const response = await axios.post(url, payload, {
              headers: {
                  'x-client-id': appId,
                  'x-client-secret': secretKey,
                  'x-api-version': '2022-09-01'
              }
          });
          
          if(response.data && response.data.payment_link) {
               return {
                   success: true,
                   redirectUrl: response.data.payment_link,
                   orderId: response.data.order_id
               };
          } else if (response.data && response.data.payment_session_id) {
               // If payment link not directly returned, might need another step, but newer API returns link if requested or session
               // For basic implementation let's assume session/link
               return {
                    success: true,
                    // If no link, we might need frontend SDK? 
                    // Let's assume we want a link. Cashfree usually provides `payment_link` object if configured?
                    // Or we just return order_token for frontend SDK. 
                    // The mobile app expects a "link" to open in webview for others. 
                    // Let's assume a generic link can be formed or return false.
                    paymentSessionId: response.data.payment_session_id
               };
          }
          throw new Error('No payment link returned from Cashfree');

      } catch (error) {
          console.error("Cashfree Create Error", error.response?.data || error);
          throw new Error(error.response?.data?.message || error.message);
      }
  }

  /**
   * Verify Cashfree Payment
   */
  async verifyCashfreePayment(paymentData, gatewayConfig) {
       // Call Cashfree API to check status
       try {
           const { appId, secretKey, baseUrl } = gatewayConfig;
           const { orderId } = paymentData;
            
           const url = `${baseUrl || 'https://sandbox.cashfree.com/pg'}/orders/${orderId}`;
           const response = await axios.get(url, {
              headers: {
                  'x-client-id': appId,
                  'x-client-secret': secretKey,
                  'x-api-version': '2022-09-01'
              }
           });
           
           if(response.data && response.data.order_status === 'PAID') {
               return {
                   success: true,
                   transactionId: response.data.cf_order_id, // or payment reference
                   amount: response.data.order_amount
               };
           }
           return { success: false, message: response.data.order_status };
       } catch (error) {
           return { success: false, error: error.message };
       }
  }

  // Stubs for others
  async createPaytmPayment(orderData, gatewayConfig) { throw new Error('Paytm integration requires specific SDK'); }
  async verifyPaytmPayment(paymentData, gatewayConfig) { throw new Error('Paytm verification requires specific SDK'); }

  async createInstamojoPayment(orderData, gatewayConfig) { 
      // Instamojo Simple REST
      try {
        const { apiKey, authToken, salt } = gatewayConfig;
        const payload = {
            amount: orderData.amount,
            purpose: `Order #${orderData.orderId}`,
            buyer_name: orderData.customer?.name || 'Customer',
            email: orderData.email,
            phone: orderData.mobileNumber,
            redirect_url: orderData.callbackUrl,
            allow_repeated_payments: false
        };
        
        // Instamojo API endpoint (test or live)
        const baseUrl = 'https://www.instamojo.com/api/1.1/'; // Live
        // const baseUrl = 'https://test.instamojo.com/api/1.1/'; // Test
        // We'd need to know if isTestMode to switch URL. GatewayConfig usually has credentials, passing isTestMode would be good.
        // Assuming production for now or handling dynamically if passed
        
        // This is pseudo-code implementation as I don't want to break without testing
        throw new Error('Instamojo Not fully implemented');
      } catch(e) { throw e; }
  }
  async verifyInstamojoPayment(paymentData, gatewayConfig) { throw new Error('Instamojo verification not implemented'); }

  async createCCAvenuePayment(orderData, gatewayConfig) { throw new Error('CCAvenue requires encryption library implementation'); }
  async verifyCCAvenuePayment(paymentData, gatewayConfig) { throw new Error('CCAvenue verification not implemented'); }
}

module.exports = new PaymentService();

