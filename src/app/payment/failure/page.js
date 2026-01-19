"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';

const PaymentFailure = () => {
    const router = useRouter();

    return (
        <>
            <Breadcrumb title="Payment Failed" />
            <section className="section-checkout padding-tb-50">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="payment-status-card" style={{
                                padding: '40px',
                                background: '#fff',
                                borderRadius: '10px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '60px', color: '#dc3545', marginBottom: '20px' }}>✗</div>
                                <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Payment Failed</h3>
                                <p style={{ marginBottom: '20px' }}>
                                    Your payment could not be processed. Please try again or choose a different payment method.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
                                    <button
                                        onClick={() => router.push('/checkout')}
                                        className="bb-btn-2"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => router.push('/orders')}
                                        className="bb-btn-2"
                                        style={{ background: '#6c757d' }}
                                    >
                                        View Orders
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PaymentFailure;

