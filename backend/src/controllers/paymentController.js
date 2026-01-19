const paymentService = require('../services/paymentService');
const { sendPaymentReceipt } = require('../services/emailService');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { v4: uuidv4 } = require('uuid');

/**
 * Create payment order for Razorpay or PhonePe
 */
async function createPaymentOrder(req, res, next) {
  try {
    const { orderId, gateway, amount, currency, callbackUrl, mobileNumber } = req.body;

    if (!orderId || !gateway || !amount) {
      return res.status(400).json({ message: 'Missing required fields: orderId, gateway, amount' });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // specific check: if order has a user_id, ensure the current user matches it
    // if order has no user_id (guest), allow it (assuming orderId knowledge is sufficient proof for now)
    if (order.user_id && (!req.userId || (order.user_id !== req.userId && req.user?.role !== 'admin'))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify amount matches order total
    if (parseFloat(amount) !== parseFloat(order.total_price)) {
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    let paymentOrder;

    if (gateway === 'razorpay') {
      // Create Razorpay order
      paymentOrder = await paymentService.createRazorpayOrder({
        amount: parseFloat(amount),
        currency: currency || 'INR',
        receipt: order.order_number,
        notes: {
          order_id: order.id,
          user_id: req.userId,
        },
      });

      // Update order with payment gateway info
      await Order.updatePaymentInfo(order.id, {
        payment_gateway: 'razorpay',
        payment_transaction_id: paymentOrder.orderId,
      });

    } else if (gateway === 'phonepe') {
      // Create PhonePe payment
      const merchantTransactionId = `TXN${Date.now()}${uuidv4().substring(0, 8).toUpperCase()}`;
      
      paymentOrder = await paymentService.createPhonePePayment({
        amount: parseFloat(amount),
        merchantTransactionId,
        callbackUrl: callbackUrl || `${req.protocol}://${req.get('host')}/payment/success`,
        mobileNumber: mobileNumber || '',
        merchantUserId: req.userId,
      });

      // Update order with payment gateway info
      await Order.updatePaymentInfo(order.id, {
        payment_gateway: 'phonepe',
        payment_transaction_id: merchantTransactionId,
      });

    } else {
      return res.status(400).json({ message: 'Invalid payment gateway' });
    }

    res.json({
      success: true,
      paymentOrder,
      orderId: order.id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify payment after completion
 */
async function verifyPayment(req, res, next) {
  try {
    const { orderId, gateway, paymentData } = req.body;

    if (!orderId || !gateway || !paymentData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user_id && (!req.userId || (order.user_id !== req.userId && req.user?.role !== 'admin'))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let verificationResult;

    // Helper to send receipt
    const sendReceipt = (orderObj) => {
        const userEmail = orderObj.email || (req.user ? req.user.email : null);
        if (userEmail) {
            const userObj = {
                email: userEmail,
                firstName: orderObj.shipping_first_name || (req.user ? req.user.firstName : 'Customer'),
                lastName: orderObj.shipping_last_name || (req.user ? req.user.lastName : ''),
            };
            sendPaymentReceipt(orderObj, userObj).catch(err => console.error("Failed to send payment receipt:", err));
        }
    };

    if (gateway === 'razorpay') {
      // Verify Razorpay payment
      verificationResult = paymentService.verifyRazorpayPayment(paymentData);

      if (verificationResult.success) {
        // Update order payment status
        await Order.updatePaymentInfo(order.id, {
          payment_transaction_id: verificationResult.paymentId,
          payment_signature: verificationResult.signature,
        });
        await Order.updatePaymentStatus(order.id, 'paid');
        await Order.updateStatus(order.id, 'confirmed');
        
        // Clear cart after successful payment
        await Cart.clear(req.userId);
        
        // Send receipt
        sendReceipt(order);
      }

    } else if (gateway === 'phonepe') {
      // For PhonePe, we might need to find the order by merchantTransactionId first
      let orderToVerify = order;
      const merchantTransactionId = paymentData.merchantTransactionId || paymentData.transactionId || order?.payment_transaction_id;
      
      if (!merchantTransactionId) {
        return res.status(400).json({ message: 'Merchant transaction ID is required' });
      }
      
      // If orderId doesn't match, try to find order by merchantTransactionId
      if (!orderToVerify || orderToVerify.payment_transaction_id !== merchantTransactionId) {
        const ordersByTxId = await Order.findByPaymentTransactionId(merchantTransactionId);
        if (ordersByTxId.length > 0) {
          orderToVerify = ordersByTxId[0];
        }
      }
      
      if (!orderToVerify) {
        return res.status(404).json({ message: 'Order not found for this transaction' });
      }
      
      // Verify PhonePe payment
      verificationResult = await paymentService.verifyPhonePePayment(merchantTransactionId);

      if (verificationResult.success) {
        // Update order payment status
        await Order.updatePaymentInfo(orderToVerify.id, {
          payment_transaction_id: verificationResult.transactionId,
        });
        await Order.updatePaymentStatus(orderToVerify.id, 'paid');
        await Order.updateStatus(orderToVerify.id, 'confirmed');
        
        // Clear cart after successful payment
        await Cart.clear(orderToVerify.user_id);
        
        // Return the updated order
        const updatedOrder = await Order.findById(orderToVerify.id);
        
        // Send receipt
        sendReceipt(updatedOrder);

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          order: updatedOrder,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: verificationResult.message || 'Payment verification failed',
        });
      }

    } else {
      return res.status(400).json({ message: 'Invalid payment gateway' });
    }

    // Handle Razorpay verification response
    if (verificationResult.success) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: await Order.findById(orderId),
      });
    } else {
      res.status(400).json({
        success: false,
        message: verificationResult.message || 'Payment verification failed',
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Verify Razorpay Payment Link callback
 */
async function verifyPaymentLink(req, res, next) {
  try {
    const { 
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature
    } = req.body;

    if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_payment_link_status || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (razorpay_payment_link_status !== 'paid') {
      return res.status(400).json({ message: 'Payment status is not paid' });
    }

    // Verify signature
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_KEY_SECRET || config.payment.razorpay.keySecret; // Use Key Secret for callback verification
    
    // Note: Payment Link callback signature construction
    // payment_link_id + "|" + payment_link_reference_id + "|" + payment_link_status + "|" + razorpay_payment_id
    const payload = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Find order by reference_id (Order Number)
    const order = await Order.findByOrderNumber(razorpay_payment_link_reference_id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    await Order.updatePaymentInfo(order.id, {
      payment_transaction_id: razorpay_payment_id,
      payment_signature: razorpay_signature,
    });
    await Order.updatePaymentStatus(order.id, 'paid');
    await Order.updateStatus(order.id, 'confirmed');

    // Clear cart if user exists
    if (order.user_id) {
      await Cart.clear(order.user_id);
    }
    
    // Send receipt
    const fullOrder = await Order.findById(order.id);
    if (fullOrder && fullOrder.email) {
      const userObj = {
        email: fullOrder.email,
        firstName: fullOrder.shipping_first_name || 'Customer',
        lastName: fullOrder.shipping_last_name || '',
      };
      sendPaymentReceipt(fullOrder, userObj).catch(err => console.error("Failed to send payment receipt (link):", err));
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: fullOrder
    });

  } catch (error) {
    next(error);
  }
}


/**
 * Razorpay webhook handler
 */
async function razorpayWebhook(req, res, next) {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

    // Verify webhook signature
    const crypto = require('crypto');
    const text = req.body.toString(); // req.body is a Buffer for raw body
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(text)
      .digest('hex');

    if (signature !== webhookSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const body = JSON.parse(text);
    const event = body.event;
    const payment = body.payload.payment.entity;

    // Find order by payment ID
    let orders = await Order.findByPaymentTransactionId(payment.id);
    let order;

    if (orders.length > 0) {
      order = orders[0];
    } else if (payment.notes && payment.notes.order_id) {
      // Fallback: Try to find by order_id from notes (used by Payment Links)
      order = await Order.findById(payment.notes.order_id);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (event === 'payment.captured' || event === 'payment.authorized') {
      await Order.updatePaymentInfo(order.id, {
        payment_transaction_id: payment.id,
        payment_signature: payment.notes?.signature || '',
      });
      await Order.updatePaymentStatus(order.id, 'paid');
      await Order.updateStatus(order.id, 'confirmed');
      
      // Clear cart after successful payment
      await Cart.clear(order.user_id);

      // Fetch full order details including shipping info for receipt
      const fullOrder = await Order.findById(order.id);
      
      // Send receipt
      if (fullOrder && fullOrder.email) {
        const userObj = {
          email: fullOrder.email,
          firstName: fullOrder.shipping_first_name || 'Customer',
          lastName: fullOrder.shipping_last_name || '',
        };
        // We import sendPaymentReceipt at top but we need to ensure it's available.
        // It is required as: const { sendPaymentReceipt } = require('../services/emailService');
        await sendPaymentReceipt(fullOrder, userObj).catch(err => console.error("Failed to send payment receipt in webhook:", err));
      }
    } else if (event === 'payment.failed') {
      await Order.updatePaymentStatus(order.id, 'failed');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * PhonePe webhook handler
 */
async function phonepeWebhook(req, res, next) {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: 'Invalid webhook data' });
    }

    // Decode base64 response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
    const { merchantTransactionId, transactionId, state, responseCode } = decodedResponse;

    // Find order by merchant transaction ID
    const orders = await Order.findByPaymentTransactionId(merchantTransactionId);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    if (state === 'SUCCESS' && responseCode === 'PAYMENT_SUCCESS') {
      await Order.updatePaymentInfo(order.id, {
        payment_transaction_id: transactionId,
      });
      await Order.updatePaymentStatus(order.id, 'paid');
      await Order.updateStatus(order.id, 'confirmed');
      
      // Clear cart after successful payment
      await Cart.clear(order.user_id);
    } else if (state === 'FAILED') {
      await Order.updatePaymentStatus(order.id, 'failed');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  verifyPaymentLink,
  razorpayWebhook,
  phonepeWebhook,
};

