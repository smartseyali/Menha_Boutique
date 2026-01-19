"use client"
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useSelector } from 'react-redux';
import { useLoadOrders } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';
import { Row } from 'react-bootstrap';

const Orders = () => {
    const orders = useSelector((state: RootState) => state.cart.orders);
    const router = useRouter()

    useLoadOrders();

    const handleViewBtn = (orderId: any) => {
        router.push(`/orders/${orderId}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'text-success';
            case 'pending':
                return 'text-warning';
            case 'cancelled':
                return 'text-danger';
            case 'processing':
                return 'text-info';
            default:
                return 'text-secondary';
        }
    };

    return (
        <>
            <section className="section-cart padding-tb-50">
                <div className="container">
                    <Row className="mb-minus-24">
                        <div className="col-12 mb-24">
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="bb-cart-table">
                                <table style={{ width: '100%' }}>
                                    <thead>
                                        <tr style={{ textAlign: "center" }}>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total Price</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4">
                                                    <span style={{ color: "#777" }}>No orders found.</span>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((data: any, index) => (
                                                <tr style={{ textAlign: "center" }} key={index}>
                                                    <td>
                                                        <a onClick={(e) => { e.preventDefault(); handleViewBtn(data.orderId); }} href="#" style={{ cursor: 'pointer' }}>
                                                            <div className="Product-cart">
                                                                <span>#{data.orderId}</span>
                                                            </div>
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <span className="price">{formatDate(data.date)}</span>
                                                    </td>
                                                    <td>
                                                        <span className="price">{data.totalItems}</span>
                                                    </td>
                                                    <td>
                                                        <span className="price">₹{(data.products.reduce((acc: number, item: any) => acc + (item.newPrice * item.quantity), 0) + (data.shippingMethod === 'free' ? 0 : 5)).toFixed(2)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`price ${getStatusBadgeClass(data.status)}`} style={{ fontWeight: 'bold' }}>
                                                            {data.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="cart-btn">
                                                            <button className='bb-btn-1 btn-padding' onClick={() => handleViewBtn(data.orderId)}>
                                                                View
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </Fade>
                        </div>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Orders
