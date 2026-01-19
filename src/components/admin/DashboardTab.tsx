"use client";

import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showErrorToast } from '../toast-popup/Toastify';

const DashboardTab = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: 0,
        ordersByStatus: {},
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await adminApi.getStats();
                setStats(data);
            } catch (error: any) {
                console.error('Error fetching stats:', error);
                showErrorToast('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading statistics...</p>
            </div>
        );
    }

    return (
        <div>
            <h4 className="mb-4">Dashboard Overview</h4>
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(45deg, #4e54c8, #8f94fb)', color: 'white'}}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="card-subtitle mb-1">Total Products</h6>
                                    <h2 className="card-title mb-0">{stats.totalProducts}</h2>
                                </div>
                                <div className="p-3 rounded-circle bg-white bg-opacity-25">
                                    <i className="ri-shopping-bag-line fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(45deg, #11998e, #38ef7d)', color: 'white'}}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="card-subtitle mb-1">Total Categories</h6>
                                    <h2 className="card-title mb-0">{stats.totalCategories}</h2>
                                </div>
                                <div className="p-3 rounded-circle bg-white bg-opacity-25">
                                    <i className="ri-folder-line fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(45deg, #ee0979, #ff6a00)', color: 'white'}}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="card-subtitle mb-1">Total Orders</h6>
                                    <h2 className="card-title mb-0">{stats.totalOrders}</h2>
                                </div>
                                <div className="p-3 rounded-circle bg-white bg-opacity-25">
                                    <i className="ri-shopping-cart-line fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={3} md={6} className="mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{background: 'linear-gradient(45deg, #4568dc, #b06ab3)', color: 'white'}}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 className="card-subtitle mb-1">Total Revenue</h6>
                                    <h2 className="card-title mb-0">₹{parseFloat(stats.totalRevenue as any || 0).toFixed(2)}</h2>
                                </div>
                                <div className="p-3 rounded-circle bg-white bg-opacity-25">
                                    <i className="ri-money-rupee-circle-line fs-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col lg={6} className="mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Recent Activity</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-center p-3 border rounded mb-3 bg-light">
                                <div className="me-3 p-3 rounded bg-primary text-white">
                                    <i className="ri-calendar-check-line fs-4"></i>
                                </div>
                                <div>
                                    <h6 className="mb-1">Recent Orders (Last 7 Days)</h6>
                                    <h3 className="mb-0 text-primary">{stats.recentOrders}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={6} className="mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Order Status Distribution</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {Object.entries(stats.ordersByStatus || {}).map(([status, count]: [string, any]) => (
                                    <div key={status} className="col-sm-6">
                                        <div className="d-flex justify-content-between align-items-center p-3 border rounded bg-light h-100">
                                            <span className="fw-medium text-capitalize">{status}</span>
                                            <span className="badge bg-primary rounded-pill px-3 py-2">{count}</span>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(stats.ordersByStatus || {}).length === 0 && (
                                    <div className="col-12 text-center text-muted py-3">
                                        No order status data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardTab;

