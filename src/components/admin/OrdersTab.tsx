"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    title?: string;
    primary_image?: string;
    product?: {
        title: string;
        primary_image: string;
    };
}

interface Order {
    id: string;
    order_number: string;
    user_id: string;
    email?: string; // Order email (guest or user)
    user_email?: string; // User account email
    user_first_name?: string;
    user_last_name?: string;
    user_phone?: string; // Added user_phone
    shipping_first_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_postal_code?: string;
    shipping_country?: string;
    billing_address?: string;
    billing_city?: string;
    total_items: number;
    subtotal: number;
    discount_amount: number;
    vat: number;
    delivery_charge: number;
    total_price: number;
    payment_method: string;
    payment_status: string;
    status: string;
    created_at: string;
    items?: OrderItem[];
}

const OrdersTab = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [newStatus, setNewStatus] = useState<string>('');

    // Debounce search effect using local timer logic or simplified effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500); 
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter, searchQuery, fromDate, toDate]); 

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
                limit: 20,
                status: statusFilter || undefined,
            };
            if (searchQuery) params.search = searchQuery;
            if (fromDate) params.fromDate = fromDate;
            if (toDate) params.toDate = toDate;

            const response = await adminApi.getAllOrders(params);
            setOrders(response.orders || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            showErrorToast('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchQuery, fromDate, toDate]);

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setShowModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) {
            return;
        }

        try {
            await adminApi.updateOrderStatus(selectedOrder.id, newStatus);
            showSuccessToast('Order status updated successfully');
            setShowModal(false);
            fetchOrders();
        } catch (error: any) {
            console.error('Error updating order status:', error);
            showErrorToast(error.message || 'Failed to update order status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: any) => {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'shipped':
            case 'completed':
                return 'bg-success';
            case 'pending':
                return 'bg-warning';
            case 'cancelled':
                return 'bg-danger';
            case 'processing':
                return 'bg-info';
            case 'packing':
                return 'bg-primary';
            default:
                return 'bg-secondary';
        }
    };

    const getCustomerName = (order: Order) => {
        if (order.user_first_name && order.user_last_name) {
            return `${order.user_first_name} ${order.user_last_name}`;
        }
        if (order.shipping_first_name && order.shipping_last_name) {
            return `${order.shipping_first_name} ${order.shipping_last_name}`;
        }
        return order.email || order.user_email || 'Guest User';
    };

    // Handler to reset page when filters change
    const onFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    return (
        <div className="bb-admin-orders">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 py-4">
                    <Row className="g-3 align-items-center justify-content-between">
                        <Col xs="auto">
                            <h5 className="mb-0 fw-bold">Orders Management</h5>
                        </Col>
                        <Col xs="auto">
                             <div className="d-flex flex-wrap align-items-center gap-2">
                                {/* Search */}
                                <div style={{ width: '250px' }}>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="ri-search-line text-muted"></i>
                                        </span>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchQuery}
                                            onChange={(e) => onFilterChange(setSearchQuery, e.target.value)}
                                            className="border-start-0"
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => onFilterChange(setFromDate, e.target.value)}
                                        size="sm"
                                        title="From Date"
                                        style={{ width: '130px' }}
                                    />
                                    <span className="text-muted">-</span>
                                    <Form.Control
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => onFilterChange(setToDate, e.target.value)}
                                        size="sm"
                                        title="To Date"
                                        style={{ width: '130px' }}
                                    />
                                </div>

                                {
                                    /* Status Filter Dropdown Removed in favor of Tabs */
                                }

                                {/* Clear Button */}
                                {(searchQuery || fromDate || toDate || statusFilter) && (
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFromDate('');
                                            setToDate('');
                                            setStatusFilter('');
                                            setCurrentPage(1);
                                        }}
                                        title="Clear Filters"
                                    >
                                        <i className="ri-filter-off-line"></i>
                                    </Button>
                                )}
                             </div>
                        </Col>
                    </Row>
                </div>

                <div className="card-body p-0">
                    {/* Status Tabs */}
                    <ul className="nav nav-tabs px-4 border-bottom-0 mt-3">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === '' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, '')}
                            >
                                All Orders
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === 'pending' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, 'pending')}
                            >
                                Pending
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === 'processing' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, 'processing')}
                            >
                                Processing
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === 'packing' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, 'packing')}
                            >
                                Packing
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === 'shipped' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, 'shipped')}
                            >
                                Shipped
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${statusFilter === 'cancelled' ? 'active fw-bold' : 'text-muted'}`}
                                onClick={() => onFilterChange(setStatusFilter, 'cancelled')}
                            >
                                Cancelled
                            </button>
                        </li>
                    </ul>

                    {loading ? (
                         <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading orders...</p>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover className="mb-0 align-middle text-nowrap">
                                <thead className="bg-light text-muted">
                                    <tr>
                                        <th className="border-0 py-3 ps-4">Order #</th>
                                        <th className="border-0 py-3">Customer</th>
                                        <th className="border-0 py-3">Mobile</th>
                                        <th className="border-0 py-3">Address</th>
                                        <th className="border-0 py-3">Items / Total</th>
                                        <th className="border-0 py-3">Payment</th>
                                        <th className="border-0 py-3">Status</th>
                                        <th className="border-0 py-3">Date</th>
                                        <th className="border-0 py-3 pe-4 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="text-center py-5 text-muted">
                                                <div className="mb-2"><i className="ri-inbox-line fs-1 opacity-50"></i></div>
                                                No orders found matching your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="ps-4">
                                                    <span className="fw-bold text-primary">#{order.order_number}</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-medium text-dark">{getCustomerName(order)}</span>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>{order.user_email}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    {order.user_phone ? (
                                                        <span className="fw-medium">{order.user_phone}</span>
                                                    ) : (
                                                        <span className="text-muted small">{order.email || order.user_email || '-'}</span>
                                                    )}
                                                </td>
                                                <td style={{ maxWidth: '200px' }}>
                                                    <div className="text-truncate" title={`${order.shipping_address}, ${order.shipping_city}, ${order.shipping_postal_code}`}>
                                                        {order.shipping_address}, {order.shipping_city}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold fs-6">₹{formatPrice(order.total_price)}</span>
                                                        <small className="text-muted">{order.total_items} Items</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-1">
                                                        <span className="text-uppercase small fw-bold text-muted">{order.payment_method}</span>
                                                        <span className={`badge ${getStatusBadgeClass(order.payment_status)} rounded-pill bg-opacity-75`} style={{ width: 'fit-content' }}>
                                                            {order.payment_status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill`}>
                                                        {order.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                        <span className="small fw-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={() => handleViewOrder(order)}
                                                        className="btn-icon text-primary bg-primary-subtle border-0"
                                                        title="View Details"
                                                    >
                                                        <i className="ri-eye-fill"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                                    <div className="text-muted small">
                                        Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                    </div>
                                    <div className="btn-group">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Order #{selectedOrder?.order_number}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <h5>Customer Information</h5>
                                    <p>
                                        <strong>Name:</strong> {getCustomerName(selectedOrder)}<br/>
                                        <strong>Email:</strong> {selectedOrder.user_email || 'N/A'}<br/>
                                        {selectedOrder.user_phone && (
                                           <><strong>Phone:</strong> {selectedOrder.user_phone}</>
                                        )}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <h5>Shipping Address</h5>
                                    <p>
                                        {selectedOrder.shipping_address || 'N/A'}
                                        <br />
                                        {selectedOrder.shipping_city || ''}
                                        {selectedOrder.shipping_postal_code ? `, ${selectedOrder.shipping_postal_code}` : ''}
                                        <br />
                                        {selectedOrder.shipping_country || ''}
                                    </p>
                                </Col>
                            </Row>

                            <h5>Order Items</h5>
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        selectedOrder.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.title || item.product?.title || 'Product'}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{formatPrice(item.unit_price)}</td>
                                                <td>₹{formatPrice(item.total_price)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center">No items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <Row className="mt-3">
                                <Col md={6}>
                                    <p>
                                        <strong>Subtotal:</strong> ₹{formatPrice(selectedOrder.subtotal)}
                                    </p>
                                    <p>
                                        <strong>Delivery Charge:</strong> ₹{formatPrice(selectedOrder.delivery_charge || 0)}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ₹{formatPrice(selectedOrder.total_price)}
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p>
                                        <strong>Payment Method:</strong> {selectedOrder.payment_method || 'N/A'}
                                    </p>
                                    <p>
                                        <strong>Payment Status:</strong>{' '}
                                        <span className={`badge ${getStatusBadgeClass(selectedOrder.payment_status)}`}>
                                            {selectedOrder.payment_status}
                                        </span>
                                    </p>
                                    <Form.Group className="mt-3">
                                        <Form.Label>
                                            <strong>Order Status</strong>
                                        </Form.Label>
                                        <Form.Select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="packing">Packing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="cancelled">Cancelled</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button
                        className="bb-btn-2"
                        onClick={handleUpdateStatus}
                        disabled={!newStatus || newStatus === selectedOrder?.status}
                    >
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrdersTab;
