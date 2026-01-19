
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, gateway, paymentData } = body;

    if (gateway !== 'razorpay') {
      return NextResponse.json(
        { message: 'Invalid gateway' },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    const bodyData = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', 'FMTOkljOdboHUgQytfxOc7su')
      .update(bodyData.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified
      // Here you might want to update the order status in your database
      // await updateOrderStatus(orderId, 'paid', paymentData);

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
