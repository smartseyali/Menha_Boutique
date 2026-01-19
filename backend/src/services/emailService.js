const axios = require('axios');

const emailSignature = `
    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin-bottom: 10px;">Please contact us for further queries.</p>
        <p style="margin-bottom: 5px;"><strong>Contact Information:</strong></p>
        <p style="color: #555; line-height: 1.6;">
            <strong>Mobile:</strong> +91 9150444595<br>
            <strong>Email:</strong> pattikadaiofficial@gmail.com<br>
            <strong>Address:</strong> No.206, V.G.V Garden, Kangeyam Road, Rakkiyapalayam, Tiruppur, Tamil Nadu, 641606
        </p>
        <p style="margin-top: 15px;">Thank you,<br>Patti Kadai Team</p>
    </div>
`;

const sendEmail = async (to, subject, html) => {
  try {
    if (!to) {
        console.warn("Email service: No recipient defined");
        return;
    }

    const payload = {
        to: to,
        subject: subject,
        msg_type: "HTML",
        msg: html
    };

    const webhookUrl = 'https://n8n.srv1198132.hstgr.cloud/webhook/send-mail';

    const response = await axios.post(webhookUrl, payload);
    
    console.log('Email sent via webhook. Status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error sending email via webhook:', error.message);
    // Log error but don't break the application flow
    return null;
  }
};

const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 20px;">
                <img src="https://pattikadai.com/assets/img/logo/logo.gif" alt="Patti Kadai" style="max-height: 80px; margin-bottom: 10px;">
                <p style="font-size: 14px; color: #555; margin: 0;">A Brand of Thandatti Foods</p>
                <h1 style="color: #F97316; margin: 15px 0 0 0;">Welcome to Patti Kadai!</h1>
            </div>
            <p>Dear <strong>${user.first_name}</strong>,</p>
            <p>Thank you for creating an account with Patti Kadai. We are thrilled to have you as part of our community!</p>
            <p>At Patti Kadai, we bring you the finest traditional foods and products.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="https://pattikadai.com" style="background-color: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping</a>
            </div>

            ${emailSignature}
        </div>
    `;
    await sendEmail(user.email, 'Welcome to Patti Kadai!', html);
};

const sendOrderConfirmation = async (order, email) => {
    // If order.items is not populated, we might want to fetch or just show basics
    const items = order.items || [];
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName || item.title || 'Product'}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${parseFloat(item.unit_price || item.unitPrice || item.price || 0).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${parseFloat(item.total_price || item.totalPrice || ((item.price || 0) * item.quantity)).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 20px;">
                <img src="https://pattikadai.com/assets/img/logo/logo.gif" alt="Patti Kadai" style="max-height: 80px; margin-bottom: 10px;">
                <p style="font-size: 14px; color: #555; margin: 0;">A Brand of Thandatti Foods</p>
                <h2 style="color: #333; margin: 15px 0 0 0;">Order Confirmation</h2>
            </div>
            <p>Thank you for your order!</p>
            <div style="background-color: #f8f8f8; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
                <p><strong>Order Number:</strong> #${order.order_number || order.orderNumber || order.id}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹${parseFloat(order.total_price || order.totalPrice || order.amount || 0).toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
            </div>
            
            <h3>Order Details</h3>
            <table border="0" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: left;">Qty</th>
                        <th style="padding: 10px; text-align: left;">Price</th>
                        <th style="padding: 10px; text-align: left;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            ${order.paymentLink ? `
            <div style="background-color: #fff3cd; color: #856404; padding: 15px; margin: 20px 0; border: 1px solid #ffeeba; border-radius: 5px;">
                <p style="margin-top: 0;"><strong>Pending Payment?</strong></p>
                <p>If you faced any difficulty with the payment or if it's pending, please use the link below to verify and complete your order:</p>
                <div style="margin: 15px 0; text-align: center;">
                    <a href="${order.paymentLink}" style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay Now</a>
                </div>
                <p style="margin-bottom: 0; font-size: 13px;">Once paid, your order status will be updated automatically.</p>
            </div>
            ` : ''}

            <p style="margin-top: 20px;">We will notify you when your order is shipped.</p>
            ${emailSignature}
        </div>
    `;
    
    await sendEmail(email, `Order Confirmation #${order.order_number || order.orderNumber || order.id}`, html);
};

const sendOrderStatusUpdate = async (order, email) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 20px;">
                <img src="https://pattikadai.com/assets/img/logo/logo.gif" alt="Patti Kadai" style="max-height: 80px; margin-bottom: 10px;">
                <p style="font-size: 14px; color: #555; margin: 0;">A Brand of Thandatti Foods</p>
                <h2 style="color: #333; margin: 15px 0 0 0;">Order Status Update</h2>
            </div>
            <p>Your order <strong>#${order.order_number || order.orderNumber}</strong> status has been updated.</p>
            <div style="background-color: #f8f8f8; padding: 15px; margin: 20px 0;">
                <p style="font-size: 18px;">New Status: <strong style="color: #F97316; text-transform: capitalize;">${order.status}</strong></p>
            </div>
            <p>Thank you for shopping with us!</p>
            ${emailSignature}
        </div>
    `;
    await sendEmail(email, `Order Status Update #${order.order_number || order.orderNumber}`, html);
};

const sendPaymentReceipt = async (order, user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                <img src="https://pattikadai.com/assets/img/logo/logo.gif" alt="Patti Kadai" style="max-height: 80px; margin-bottom: 10px;">
                <p style="font-size: 14px; color: #555; margin: 0;">A Brand of Thandatti Foods</p>
                <h1 style="color: #28a745; margin: 20px 0 0 0;">Payment Successful</h1>
                <p style="color: #666; margin-top: 5px;">Transaction Reference: ${order.transaction_id || order.payment_transaction_id || 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p>Dear <strong>${user.first_name || 'Customer'}</strong>,</p>
                <p>We have successfully received your payment for Order <strong>#${order.order_number || order.orderNumber}</strong>.</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
                <table style="width: 100%;">
                    <tr>
                        <td style="color: #666; padding: 5px 0;">Amount Paid:</td>
                        <td style="font-weight: bold; text-align: right; padding: 5px 0;">₹${parseFloat(order.total_price || order.amount).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="color: #666; padding: 5px 0;">Date:</td>
                        <td style="font-weight: bold; text-align: right; padding: 5px 0;">${new Date().toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="color: #666; padding: 5px 0;">Payment Method:</td>
                        <td style="font-weight: bold; text-align: right; padding: 5px 0;">${(order.payment_method || 'Online').toUpperCase()}</td>
                    </tr>
                </table>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                <p>This is an automated receipt.</p>
            </div>
            ${emailSignature}
        </div>
    `;
    await sendEmail(user.email, `Payment Receipt - Order #${order.order_number || order.orderNumber}`, html);
};

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendPaymentReceipt,
    sendEmail
};
