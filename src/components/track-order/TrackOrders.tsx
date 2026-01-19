import React from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLoadOrders } from '@/hooks/useOrders';

const TrackOrders = () => {
    const orders = useSelector((state: RootState) => state.cart.orders);
    useLoadOrders();

    const getProgressStep = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 1;
            case 'processing': return 2;
            case 'shipped':
            case 'dispatched': return 4;
            case 'delivered':
            case 'completed': return 5;
            case 'cancelled': return 0;
            default: return 1;
        }
    };

    const getExpectedDate = (dateString: string) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 7); // Add 7 days
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <section className="section-track padding-tb-50">
            <div className="container">
                <Row>
                    <Col sm={12}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center">
                            <div className="section-detail">
                                <h2 className="bb-title">Track<span> order</span></h2>
                                <p>check your arriving order.</p>
                            </div>
                        </Fade>
                    </Col>
                    <Col sm={12}>
                        {orders.length === 0 ? (
                            <div className="text-center py-5">
                                <h4>No active orders found.</h4>
                            </div>
                        ) : (
                            orders.map((order: any, index: number) => {
                                const currentStep = getProgressStep(order.status);
                                return (
                                    <div className="track mb-5" key={index}>
                                        <Row className="mb-minus-24">
                                            <Col md={4} className="mb-24">
                                                <div className="block-title">
                                                    <h6>Order</h6>
                                                    <p>#{order.orderId}</p>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-24">
                                                <div className="block-title">
                                                    <h6>Items</h6>
                                                    <p>{order.products.map((p: any) => p.title).join(', ')}</p>
                                                </div>
                                            </Col>
                                            <Col md={4} className="mb-24">
                                                <div className="block-title">
                                                    <h6>Expected date</h6>
                                                    <p>{getExpectedDate(order.date)}</p>
                                                </div>
                                            </Col>
                                            <Col md={12} className="mb-24">
                                                <ul className="bb-progress">
                                                    <li className={currentStep >= 1 ? "active" : ""}>
                                                        <span className="number">1</span>
                                                        <span className="icon"><i className="ri-check-double-line"></i></span>
                                                        <span className="title">Order<br></br>Confirmed</span>
                                                    </li>
                                                    <li className={currentStep >= 2 ? "active" : ""}>
                                                        <span className="number">2</span>
                                                        <span className="icon"><i className="ri-settings-line"></i></span>
                                                        <span className="title">Processing<br></br>Order</span>
                                                    </li>
                                                    <li className={currentStep >= 3 ? "active" : ""}>
                                                        <span className="number">3</span>
                                                        <span className="icon"><i className="ri-gift-2-line"></i></span>
                                                        <span className="title">Quality<br></br>Check</span>
                                                    </li>
                                                    <li className={currentStep >= 4 ? "active" : ""}>
                                                        <span className="number">4</span>
                                                        <span className="icon"><i className="ri-truck-line"></i></span>
                                                        <span className="title">Product<br></br>Dispatched</span>
                                                    </li>
                                                    <li className={currentStep >= 5 ? "active" : ""}>
                                                        <span className="number">5</span>
                                                        <span className="icon"><i className="ri-home-office-line"></i></span>
                                                        <span className="title">Product<br></br>Delivered</span>
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </div>
                                );
                            })
                        )}
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default TrackOrders
