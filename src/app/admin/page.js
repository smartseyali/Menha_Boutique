"use client";

import React, { useState } from 'react';
import { Col, Row, Tab, Nav } from 'react-bootstrap';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import DashboardTab from '@/components/admin/DashboardTab';
import ProductsTab from '@/components/admin/ProductsTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import OrdersTab from '@/components/admin/OrdersTab';
import UsersTab from '@/components/admin/UsersTab';
import DeliveryTab from '@/components/admin/DeliveryTab';

import BannersTab from '@/components/admin/BannersTab';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <AdminProtectedRoute>
            <section className="section-admin py-5 bg-light">
                <div className="container">
                    <Row className="mb-4">
                        <Col lg={12}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h2 className="mb-1 fw-bold">Admin Dashboard</h2>
                                    <p className="text-muted mb-0">Manage your store products, categories, and orders</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboard')}>
                                <Nav variant="pills" className="bg-white p-2 rounded shadow-sm mb-4">
                                    <Nav.Item>
                                        <Nav.Link eventKey="dashboard" className="px-4 py-2">
                                            <i className="ri-dashboard-line me-2"></i> Dashboard
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="products" className="px-4 py-2">
                                            <i className="ri-shopping-bag-line me-2"></i> Products
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="categories" className="px-4 py-2">
                                            <i className="ri-folder-line me-2"></i> Categories
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="orders" className="px-4 py-2">
                                            <i className="ri-shopping-cart-line me-2"></i> Orders
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="users" className="px-4 py-2">
                                            <i className="ri-user-line me-2"></i> Users
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="delivery" className="px-4 py-2">
                                            <i className="ri-truck-line me-2"></i> Delivery
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="banners" className="px-4 py-2">
                                            <i className="ri-image-line me-2"></i> Banners & Videos
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>

                                <Tab.Content>
                                    <Tab.Pane eventKey="dashboard">
                                        <DashboardTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="products">
                                        <ProductsTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="categories">
                                        <CategoriesTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="orders">
                                        <OrdersTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="users">
                                        <UsersTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="delivery">
                                        <DeliveryTab />
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="banners">
                                        <BannersTab />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Col>
                    </Row>
                </div>
            </section>
        </AdminProtectedRoute>
    );
};

export default AdminPage;

