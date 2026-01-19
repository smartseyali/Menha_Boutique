"use client"
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';
import { useLoadOrders } from '@/hooks/useOrders';
import { orderApi, mapOrderToFrontend } from '@/utils/api';

interface Product {
    id: string | number;
    title: string;
    newPrice: number;
    weight: string;
    image: string;
    imageTwo: string;
    date: string;
    status: string;
    rating: number;
    oldPrice: number | string;
    location: string;
    brand: string;
    sku: string | number;
    category: string;
    quantity: number;
}

interface Order {
    orderId: string | number;
    date: string;
    status: string;
    totalPrice: number;
    totalItems: number;
    shippingMethod: string;
    products: Product[];
    address: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
    } | null;
}

const OrderPage = ({ id }: any) => {
    const orders = useSelector((state: RootState) => state.cart.orders);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    
    useLoadOrders();

    useEffect(() => {
        const loadOrder = async () => {
            try {
                // First check Redux store
                let foundOrder = orders.find((o: any) => o.orderId === id || o.id === id);
                
                if (!foundOrder) {
                    // If not found, try to fetch from API
                    try {
                        // Try fetching as guest if not found in store (which might be populated for auth user)
                        // If user is logged in, this call works. If guest, we need to pass true if we have the ID.
                        // However, for security, we can't just fetch any ID as guest.
                        // But since we are on the frontend, if the user has the ID (e.g. from URL), we can try.
                        // The backend 'optionalAuth' allows it, but we need to pass 'isGuest=true' to api wrapper
                        // if we want to bypass the frontend auth check if it exists.
                        // Actually, api.ts getById takes (id, isGuest).
                        
                        // Check if we have a guest order ID in session storage that matches
                        const guestOrderId = sessionStorage.getItem('guest_last_order_id');
                        const isGuest = guestOrderId === id;

                        const orderData = await orderApi.getById(id, isGuest);
                        if (orderData) {
                            foundOrder = mapOrderToFrontend(orderData, orderData.items);
                        }
                    } catch (error) {
                        console.error('Error fetching order:', error);
                    }
                }
                
                setOrder((foundOrder as Order) || null);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadOrder();
        }
    }, [id, orders]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    function isOrderWithData(obj: any): obj is Order {
        return (
            typeof obj === "object" && obj !== null && Array.isArray(obj.products)
        );
    }

    return (
        <>
            <section className="section-cart padding-tb-50">
                <div className="container">
                    <div className="row mb-minus-24">
                        <div className="col-12 mb-24">
                            {loading ? (
                                <div className="text-center py-5">Loading order details...</div>
                            ) : isOrderWithData(order) ? (
                                <Fade triggerOnce direction='up' duration={1000} delay={200} className="bb-cart-table">
                                    <div className="card mb-4">
                                        <div className="card-header bg-light">
                                            <div className="row align-items-center">
                                                <div className="col">
                                                    <h5 className="mb-0">Order #{order.orderId}</h5>
                                                </div>
                                                <div className="col-auto">
                                                    <span className="text-muted">{formatDate(order.date)}</span>
                                                    <span className={`badge ms-2 ${order.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            {/* Order Items Table */}
                                            <table style={{ width: '100%' }} className="table table-borderless">
                                                <thead>
                                                    <tr style={{ textAlign: "center", borderBottom: "1px solid #eee" }}>
                                                        <th>Image</th>
                                                        <th>Product Name</th>
                                                        <th>Price</th>
                                                        <th>Quantity</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.products.map((product: Product, productIndex: number) => (
                                                        <tr style={{ textAlign: "center", borderBottom: "1px solid #eee" }} key={productIndex}>
                                                            <td className="py-3">
                                                                <div className="Product-cart">
                                                                    <img src={product.image} alt={product.title} style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <span>{product.title}</span>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className="price">₹{product.newPrice.toFixed(2)}</span>
                                                            </td>
                                                            <td className="py-3">
                                                                <span>{product.quantity}</span>
                                                            </td>
                                                            <td className="py-3">
                                                                <span className="price">₹{(product.newPrice * product.quantity).toFixed(2)}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Order Summary */}
                                            <div className="row mt-4">
                                                <div className="col-md-6">
                                                    {order.address && (
                                                        <div className="mb-3">
                                                            <h6>Shipping Address</h6>
                                                            <p className="mb-0 text-muted">
                                                                {order.address.firstName} {order.address.lastName}<br />
                                                                {order.address.address}<br />
                                                                {order.address.city}, {order.address.postalCode}<br />
                                                                {order.address.country}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="bg-light p-3 rounded">
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span>Subtotal:</span>
                                                            <span>₹{order.products.reduce((acc, item) => acc + (item.newPrice * item.quantity), 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span>Shipping:</span>
                                                            <span>{order.shippingMethod === 'free' ? 'Free' : '₹5.00'}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                                            <strong>Total:</strong>
                                                            <strong>₹{(order.products.reduce((acc, item) => acc + (item.newPrice * item.quantity), 0) + (order.shippingMethod === 'free' ? 0 : 5)).toFixed(2)}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Fade>
                            ) : (
                                <div className="text-center py-5">
                                    <h3>Order not found</h3>
                                    <p className="text-muted">The order you are looking for does not exist or you do not have permission to view it.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default OrderPage
