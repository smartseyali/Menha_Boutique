"use client"
import { RootState } from '@/store'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useSelector } from 'react-redux'
import { authApi } from '@/utils/authApi'
import { Col, Row, Table, Modal, Button, Badge } from 'react-bootstrap'
import Link from 'next/link'

import { paymentApi } from '@/utils/api'
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify'

const MyOrders = () => {
    const router = useRouter()
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkPaymentParams = async () => {
            if (typeof window === 'undefined') return;
            
            const params = new URLSearchParams(window.location.search);
            const razorpay_payment_id = params.get('razorpay_payment_id');
            const razorpay_payment_link_id = params.get('razorpay_payment_link_id');
            const razorpay_payment_link_reference_id = params.get('razorpay_payment_link_reference_id');
            const razorpay_payment_link_status = params.get('razorpay_payment_link_status');
            const razorpay_signature = params.get('razorpay_signature');

            if (razorpay_payment_id && razorpay_payment_link_id && razorpay_payment_link_status === 'paid' && razorpay_signature) {
                 try {
                     setLoading(true);
                     await paymentApi.verifyPaymentLink({
                         razorpay_payment_id,
                         razorpay_payment_link_id,
                         razorpay_payment_link_reference_id: razorpay_payment_link_reference_id || '',
                         razorpay_payment_link_status,
                         razorpay_signature
                     });
                     showSuccessToast('Payment verified successfully!');
                     router.push('/my-orders'); // clear params
                 } catch (err) {
                    showErrorToast('Payment verification failed.');
                 }
            }
        };

        checkPaymentParams();
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await authApi.getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, router]);

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'completed': 
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <section className="section-cart padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24">
                    <Col lg={3} className="mb-24">
                        <Fade triggerOnce direction='up' duration={1000} delay={200} >
                            <div className="bb-cart-sidebar-block bb-sidebar-wrap bb-border-box bb-sticky-sidebar">
                                <div className="bb-vendor-block-items">
                                    <ul>
                                        <li><Link href="/user-profile">User Profile</Link></li>
                                        <li><Link href="/my-orders" className="active">My Orders</Link></li>
                                        <li><Link href="/cart">Cart</Link></li>
                                        <li><Link href="/checkout">Checkout</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </Fade>
                    </Col>
                    <Col lg={9}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="bb-cart-table margin-buttom">
                                <div className="bb-vender-about-block mb-24">
                                        <h5>My Orders</h5>
                                </div>
                                {loading ? (
                                        <div>Loading orders...</div>
                                ) : orders.length === 0 ? (
                                        <div>No orders found.</div>
                                ) : (
                                    <>
                                    <div className="table-responsive desktop-orders-table">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Order #</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id}>
                                                        <td>{order.order_number}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadge(order.status)}>{order.status}</Badge>
                                                        </td>
                                                        <td>₹{order.total_price}</td>
                                                        <td>
                                                            <Button variant="outline-primary" size="sm" onClick={() => handleViewOrder(order)} style={{marginRight: '5px'}}>
                                                                View Details
                                                            </Button>
                                                            {(order.status === 'pending' || order.payment_status === 'pending_payment' || order.payment_status === 'pending') && (order.payment_link || order.paymentLink) && (
                                                                <a href={order.payment_link || order.paymentLink} className="btn btn-success btn-sm" target="_blank" rel="noopener noreferrer">
                                                                    Pay Now
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Mobile View - List */}
                                    <div className="mobile-orders-list">
                                        {orders.map((order) => (
                                            <div className="mobile-order-item" key={order.id}>
                                                <div className="mobile-order-header">
                                                    <strong>{order.order_number}</strong>
                                                    <Badge bg={getStatusBadge(order.status)}>{order.status}</Badge>
                                                </div>
                                                <div className="mobile-order-detail-row">
                                                        <span className="text-muted">Date:</span>
                                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mobile-order-detail-row">
                                                        <span className="text-muted">Total:</span>
                                                        <strong>₹{order.total_price}</strong>
                                                </div>
                                                <div className="mobile-order-actions">
                                                        <Button variant="outline-primary" size="sm" onClick={() => handleViewOrder(order)} style={{marginRight: '5px'}}>
                                                            View Details
                                                        </Button>
                                                        {(order.status === 'pending' || order.payment_status === 'pending_payment' || order.payment_status === 'pending') && (order.payment_link || order.paymentLink) && (
                                                            <a href={order.payment_link || order.paymentLink} className="btn btn-success btn-sm" target="_blank" rel="noopener noreferrer">
                                                                Pay Now
                                                            </a>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    </>
                                )}
                           </div>
                        </Fade>
                    </Col>
                </Row>
            </div>

            {/* Order Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Order Details: {selectedOrder?.order_number}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>Status:</strong> <Badge bg={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</Badge>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Shipping Method:</strong> {selectedOrder.shipping_method}
                                </Col>
                                <Col md={6}>
                                    <strong>Payment Method:</strong> {selectedOrder.payment_method}
                                </Col>
                            </Row>
                            
                            <h6>Items</h6>
                            <div className="table-responsive desktop-order-details-table">
                                <Table size="sm" striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th style={{width: '60px'}}>Image</th>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.primary_image && (
                                                        <img src={item.primary_image} alt={item.title} style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                                                    )}
                                                </td>
                                                <td>
                                                    <div>{item.title}</div>
                                                    <small className="text-muted">{item.sku}</small>
                                                </td>
                                                <td>₹{item.unit_price}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.total_price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Mobile View - Item List */}
                            <div className="mobile-order-details-list d-lg-none">
                                {selectedOrder.items?.map((item: any) => (
                                    <div className="mobile-order-details-item" key={item.id}>
                                        <div className="mobile-order-item-img">
                                             {item.primary_image ? (
                                                <img src={item.primary_image} alt={item.title} />
                                             ) : (
                                                <div style={{width:'100%', height:'100%', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                    <small>No Img</small>
                                                </div>
                                             )}
                                        </div>
                                        <div className="mobile-order-item-info">
                                            <div className="mobile-order-item-title">{item.title}</div>
                                            <div className="mobile-order-item-sku">{item.sku}</div>
                                            <div className="mobile-order-item-price-qty">
                                                <span>₹{item.unit_price} x {item.quantity}</span>
                                                <strong>₹{item.total_price}</strong>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-end">
                                <h5>Total: ₹{selectedOrder.total_price}</h5>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    )
}

export default MyOrders
