const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config/config');

class PaymentService {
  constructor() {
    // Initialize Razorpay
    if (config.payment.razorpay.keyId && config.payment.razorpay.keySecret) {
      this.razorpay = new Razorpay({
        key_id: config.payment.razorpay.keyId,
        key_secret: config.payment.razorpay.keySecret,
      });
    }

    // PhonePe configuration
    this.phonepeConfig = config.payment.phonepe;
  }

  /**
   * Create Razorpay Payment Link
   */
  async createRazorpayPaymentLink(orderData) {
    try {
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

      const paymentLink = await this.razorpay.paymentLink.create(options);
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
  async createRazorpayOrder(orderData) {
    try {
      const { amount, currency, receipt, notes } = orderData;

      const options = {
        amount: amount * 100, // Convert to paise
        currency: currency || 'INR',
        receipt: receipt,
        notes: notes || {},
      };

      const order = await this.razorpay.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.payment.razorpay.keyId,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment
   */
  verifyRazorpayPayment(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', config.payment.razorpay.keySecret)
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
  generatePhonePeXVerify(base64Payload, endpoint) {
    const stringToHash = base64Payload + endpoint + this.phonepeConfig.saltKey;
    const hash = crypto
      .createHash('sha256')
      .update(stringToHash)
      .digest('hex');
    const finalHash = hash + '###' + this.phonepeConfig.saltIndex;
    return finalHash;
  }

  /**
   * Create PhonePe payment request
   */
  async createPhonePePayment(orderData) {
    try {
      const { amount, merchantTransactionId, callbackUrl, mobileNumber, merchantUserId } = orderData;

      const payload = {
        merchantId: this.phonepeConfig.merchantId,
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
      const xVerify = this.generatePhonePeXVerify(base64Payload, endpoint);

      const response = await axios.post(
        `${this.phonepeConfig.baseUrl}${endpoint}`,
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
  async verifyPhonePePayment(merchantTransactionId) {
    try {
      const endpoint = `/pg/v1/status/${this.phonepeConfig.merchantId}/${merchantTransactionId}`;
      const url = `${this.phonepeConfig.baseUrl}${endpoint}`;
      const xVerify = this.generatePhonePeXVerify('', endpoint);

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.phonepeConfig.merchantId,
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
}

module.exports = new PaymentService();

