
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_RoJzj2i6grQo59',
  key_secret: 'FMTOkljOdboHUgQytfxOc7su',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, currency = 'INR', callbackUrl } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { message: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: orderId.toString(),
      notes: {
        orderId: orderId.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      paymentOrder: {
        orderId: order.id, // Razorpay Order ID (starts with order_)
        systemOrderId: orderId, // Our internal Order ID
        amount: order.amount,
        currency: order.currency,
        keyId: 'rzp_test_RoJzj2i6grQo59',
      },
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    // Log extended razorpay error details if available
    if (error.error) {
        console.error('Razorpay Error Details:', error.error);
    }
    
    return NextResponse.json(
      { 
        message: error.error?.description || error.description || error.message || 'Failed to create Razorpay order',
        details: error
      },
      { status: 500 }
    );
  }
}
