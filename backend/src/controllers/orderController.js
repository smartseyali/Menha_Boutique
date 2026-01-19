const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const paymentService = require('../services/paymentService');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');

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

    // Generate Razorpay Payment Link if method is razorpay
    if (paymentMethod === 'razorpay') {
      try {
        // Try to get customer phone from request body if available (guest checkout usually passes phone)
        // Or from user object if logged in
        const customerPhone = req.body.phone || req.body.mobile || (req.user ? req.user.mobile : undefined);
        const customerName = req.body.name || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Customer');

        const paymentLinkResult = await paymentService.createRazorpayPaymentLink({
          amount: order.total_price || order.totalPrice,
          currency: 'INR',
          description: `Payment for Order #${order.order_number || order.id}`,
          customer: {
            name: customerName,
            contact: customerPhone
          },
          callbackUrl: `${process.env.CORS_ORIGIN || 'https://pattikadai.com'}/my-orders`,
          reference_id: order.order_number,
          notes: {
            order_id: order.id,
            user_id: req.userId || ''
          }
        });

        if (paymentLinkResult && paymentLinkResult.short_url) {
          order.paymentLink = paymentLinkResult.short_url;
          // Persist payment link to database
          await Order.updatePaymentLink(order.id, order.paymentLink);
        }
      } catch (plError) {
        console.error('Failed to generate payment link for email:', plError);
        // Continue without link
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
      requiresPayment: paymentMethod === 'razorpay' || paymentMethod === 'phonepe',
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
    } else if (order.user_id) {
        // If no email on order but has user_id, we might want to fetch user
        // For now skipping to avoid complexity
    }
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
};

