const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const paymentService = require('../services/paymentService');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');
const PaymentGateway = require('../models/PaymentGateway');

async function getUserOrders(req, res, next) {
  try {
    const orders = await Order.findByUserId(req.userId);
    
    // Get order items for each order
    for (let order of orders) {
      order.items = await OrderItem.findByOrderId(order.id);
    }

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order (unless admin)
    const userId = req.userId || null;
    const userRole = req.user ? req.user.role : 'guest';

    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.items = await OrderItem.findByOrderId(order.id);

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

async function getOrderByTransactionId(req, res, next) {
  try {
    const { transactionId } = req.params;
    const orders = await Order.findByPaymentTransactionId(transactionId);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Check if user owns this order (unless admin)
    if (order.user_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.items = await OrderItem.findByOrderId(order.id);

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const {
      shippingAddressId,
      billingAddressId,
      shippingMethod,
      items,
      couponCode,
      paymentMethod,
      email,
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
      subtotal += itemTotal;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: itemTotal,
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const couponValidation = await Coupon.validate(couponCode, req.userId, subtotal);
      if (couponValidation.valid) {
        discountAmount = couponValidation.discountAmount;
        couponId = couponValidation.coupon.id;
      } else {
        return res.status(400).json({ message: couponValidation.message });
      }
    }

    const deliveryChargeAmount = parseFloat(req.body.deliveryCharge) || 0;
    const vat = 0; // VAT is not included in this calculation to match frontend
    const totalPrice = subtotal + vat + deliveryChargeAmount - discountAmount;

    // Determine payment status based on payment method
    let paymentStatus = 'pending';
    let paymentGateway = null;
    
    if (paymentMethod === 'razorpay' || paymentMethod === 'phonepe') {
      paymentStatus = 'pending_payment';
      paymentGateway = paymentMethod;
    } else if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
      paymentGateway = 'cod';
    }

    // Create order
    const orderData = {
      userId: req.userId || null,
      shippingAddressId,
      billingAddressId,
      shippingMethod: shippingMethod || 'free',
      totalItems: items.reduce((sum, item) => sum + parseInt(item.quantity), 0),
      subtotal,
      discountAmount,
      vat,
      totalPrice,
      couponCode: couponCode || null,
      paymentMethod,
      paymentStatus,
      deliveryCharge: deliveryChargeAmount,
      email: email || (req.user ? req.user.email : null),
    };

    const order = await Order.create(orderData);

    // Update payment gateway info if applicable
    if (paymentGateway) {
      await Order.updatePaymentInfo(order.id, {
        payment_gateway: paymentGateway,
      });
    }

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.createBulk(orderItemsData);

    // Record coupon usage if applicable
    if (couponId) {
      await Coupon.recordUsage(couponId, req.userId || null, order.id, discountAmount);
    }

    // Clear cart always as per requirement (User wants cart cleared "once order placed")
    if (req.userId) {
      await Cart.clear(req.userId);
    }

    // Get order with items
    order.items = await OrderItem.findByOrderId(order.id);

    // Generate Payment Link
    let requiresPayment = false;
    let paymentLink = null;

    if (paymentMethod !== 'cod') {
        try {
            const activeGateway = await PaymentGateway.findOne({ isActive: true });
            
            if (activeGateway) {
                requiresPayment = true;
                const customerPhone = req.body.phone || req.body.mobile || (req.user ? req.user.mobile : undefined);
                const customerName = req.body.name || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Customer');
                
                if (activeGateway.name === 'razorpay') {
                    const paymentLinkResult = await paymentService.createRazorpayPaymentLink({
                        amount: order.total_price || order.totalPrice,
                        currency: 'INR',
                        description: `Payment for Order #${order.order_number || order.id}`,
                        customer: { name: customerName, contact: customerPhone },
                        callbackUrl: `${process.env.CORS_ORIGIN || 'https://pattikadai.com'}/my-orders`,
                        reference_id: order.order_number,
                        notes: { order_id: order.id, user_id: req.userId || '' }
                    }, activeGateway.credentials);
                    
                    if (paymentLinkResult && paymentLinkResult.short_url) {
                         paymentLink = paymentLinkResult.short_url;
                    }
                } else if (activeGateway.name === 'phonepe') {
                     // PhonePe Pay Page
                     const merchantTransactionId = `TXN${Date.now()}${Math.floor(Math.random()*1000)}`;
                     const paymentResult = await paymentService.createPhonePePayment({
                        amount: order.total_price || order.totalPrice,
                        merchantTransactionId: merchantTransactionId,
                        callbackUrl: `${process.env.CORS_ORIGIN || 'https://pattikadai.com'}/payment/success`, // Needs to be handled by frontend/backend
                        mobileNumber: customerPhone,
                        merchantUserId: req.userId
                     }, activeGateway.credentials);

                     if (paymentResult && paymentResult.redirectUrl) {
                         paymentLink = paymentResult.redirectUrl;
                         // Store transaction ID
                         await Order.updatePaymentInfo(order.id, { 
                             payment_gateway: 'phonepe',
                             payment_transaction_id: merchantTransactionId 
                         });
                     }
                } else if (activeGateway.name === 'cashfree') {
                     const paymentResult = await paymentService.createCashfreePayment({
                        amount: order.total_price || order.totalPrice,
                        orderId: `ORDER_${order.order_number}`, // Cashfree requires specific format sometimes
                        customerDate: Date.now(),
                        mobileNumber: customerPhone,
                        callbackUrl: `${process.env.CORS_ORIGIN || 'https://pattikadai.com'}/payment/callback/cashfree`,
                        email: orderEmail,
                        merchantUserId: req.userId
                     }, activeGateway.credentials);
                     
                     if (paymentResult && paymentResult.redirectUrl) {
                        paymentLink = paymentResult.redirectUrl;
                        await Order.updatePaymentInfo(order.id, { payment_gateway: 'cashfree' });
                     } else if (paymentResult && paymentResult.paymentSessionId) {
                        // If it returns session ID, we might need to construct link or handle in frontend. 
                        // For now, let's assume redirectUrl is populated by our service if feasible.
                     }
                } else if (activeGateway.name === 'paytm') {
                     // Placeholder until SDK
                     console.log('Paytm is active but requires SDK implementation');
                } else if (activeGateway.name === 'instamojo') {
                     const paymentResult = await paymentService.createInstamojoPayment({
                        amount: order.total_price || order.totalPrice,
                        orderId: order.order_number,
                        customer: { name: customerName },
                        email: orderEmail,
                        mobileNumber: customerPhone,
                        callbackUrl: `${process.env.CORS_ORIGIN || 'https://pattikadai.com'}/payment/callback/instamojo`
                     }, activeGateway.credentials);
                     if (paymentResult && paymentResult.redirectUrl) {
                        paymentLink = paymentResult.redirectUrl;
                        await Order.updatePaymentInfo(order.id, { payment_gateway: 'instamojo' });
                     }
                }
                
                if (paymentLink) {
                   order.paymentLink = paymentLink;
                   await Order.updatePaymentLink(order.id, order.paymentLink);
                }
            }
        } catch (plError) {
             console.error('Failed to generate payment link:', plError);
        }
    }

    // Send order confirmation email
    const orderEmail = order.email || (req.user ? req.user.email : null);
    if (orderEmail) {
      sendOrderConfirmation(order, orderEmail).catch(err => console.error('Failed to send order confirmation email:', err));
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
      requiresPayment,
      paymentLink
    });
  } catch (error) {
    next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const { page = 1, limit = 50, status, fromDate, toDate, search } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      fromDate,
      toDate,
      search,
    };

    const orders = await Order.findAll(options);
    const total = await Order.count(options);

    // Get order items for each order
    for (let order of orders) {
      order.items = await OrderItem.findByOrderId(order.id);
    }

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const order = await Order.updateStatus(id, status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order,
    });

    // Send status update email
    if (order.email) {
      sendOrderStatusUpdate(order, order.email).catch(err => console.error('Failed to send status update email:', err));
    }
  } catch (error) {
    next(error);
  }
}

async function bulkUpdateOrderStatus(req, res, next) {
    try {
        const { updates } = req.body; // Expecting { updates: [{ order_number: '...', status: '...' }, ...] }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty updates list' });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const update of updates) {
            try {
                const { order_number, status } = update;
                if (!order_number || !status) {
                    results.failed.push({ order_number, reason: 'Missing order_number or status' });
                    continue;
                }

                // Update using order number
                const order = await Order.updateStatusByOrderNumber(order_number, status.toLowerCase());
                
                if (order) {
                    results.success.push({ order_number, status: order.status });
                    
                    // Send email - fire and forget
                    if (order.email) {
                        sendOrderStatusUpdate(order, order.email).catch(err => console.error(`Failed to send email for order ${order_number}:`, err));
                    }
                } else {
                    results.failed.push({ order_number, reason: 'Order not found' });
                }
            } catch (err) {
                console.error(`Error updating order ${update.order_number}:`, err);
                results.failed.push({ order_number: update.order_number, reason: err.message });
            }
        }

        res.json({
            message: 'Bulk update completed',
            results
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
  getUserOrders,
  getOrderById,
  getOrderByTransactionId,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  bulkUpdateOrderStatus,
};

