import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Pagination, Badge, Spinner, Button, InputGroup, Modal } from 'react-bootstrap';
import Image from 'next/image';
import { adminApi } from '@/utils/adminApi';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_photo: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface Address {
    id: string;
    address_line: string;
    city: string;
    state_name: string;
    country_name: string;
    postal_code: string;
    is_default: boolean;
    address_type: string;
}

const UsersTab = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userAddresses, setUserAddresses] = useState<Address[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        role: 'customer',
        is_active: true
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers({
                page: currentPage,
                limit: 20,
                search: searchTerm
            });
            setUsers(data.users);
            setTotalPages(data.pagination.pages);
            setTotalUsers(data.pagination.total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers();
    };

    const handleReset = () => {
        setSearchTerm('');
        setCurrentPage(1);
        setTimeout(() => {
             adminApi.getUsers({ page: 1, limit: 20, search: '' }).then(data => {
                setUsers(data.users);
                setTotalPages(data.pagination.pages);
                setTotalUsers(data.pagination.total);
             });
        }, 0);
    };

    const handleViewUser = async (userId: string) => {
        setShowModal(true);
        setModalLoading(true);
        try {
            const data = await adminApi.getUserDetails(userId);
            setSelectedUser(data.user);
            setUserAddresses(data.addresses);
            setEditForm({
                role: data.user.role,
                is_active: data.user.is_active
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
            setShowModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        
        try {
            await adminApi.updateUserStatus(selectedUser.id, editForm);
            toast.success('User updated successfully');
            setShowModal(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    return (
        <>
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">Registered Users ({totalUsers})</h5>
                        </Col>
                        <Col md="auto">
                            <Form onSubmit={handleSearch} className="d-flex gap-2">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button variant="outline-primary" type="submit">
                                        <i className="ri-search-line"></i>
                                    </Button>
                                    {searchTerm && (
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            <i className="ri-close-line"></i>
                                        </Button>
                                    )}
                                </InputGroup>
                            </Form>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading users...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 py-3 ps-4">User</th>
                                        <th className="border-0 py-3">Phone</th>
                                        <th className="border-0 py-3">Role</th>
                                        <th className="border-0 py-3">Status</th>
                                        <th className="border-0 py-3">Joined Date</th>
                                        <th className="border-0 py-3 text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar me-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                            {user.profile_photo ? (
                                                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                                     <Image 
                                                                         src={user.profile_photo} 
                                                                         alt={user.first_name} 
                                                                         fill
                                                                         className="rounded-circle object-fit-cover"
                                                                         sizes="40px"
                                                                     />
                                                                </div>
                                                            ) : (
                                                                <span className="text-primary fw-bold">
                                                                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 text-dark">{user.first_name} {user.last_name}</h6>
                                                            <small className="text-muted">{user.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{user.phone_number || '-'}</td>
                                                <td>
                                                    <Badge bg={user.role === 'admin' ? 'danger' : 'info'} className="text-capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={user.is_active ? 'success' : 'secondary'}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="text-end pe-4">
                                                    <Button 
                                                        variant="light" 
                                                        size="sm" 
                                                        className="text-primary"
                                                        onClick={() => handleViewUser(user.id)}
                                                    >
                                                        <i className="ri-eye-line me-1"></i> View / Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-muted">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
                <Card.Footer className="bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {users.length} of {totalUsers} users
                        </small>
                        {totalPages > 1 && (
                            <Pagination className="mb-0">
                                <Pagination.Prev 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                />
                                {[...Array(totalPages)].map((_, idx) => (
                                    <Pagination.Item 
                                        key={idx + 1} 
                                        active={idx + 1 === currentPage}
                                        onClick={() => setCurrentPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        )}
                    </div>
                </Card.Footer>
            </Card>

            {/* User Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {modalLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : selectedUser && (
                        <div>
                            <div className="d-flex align-items-center mb-4">
                                <div className="avatar me-4 bg-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                    {selectedUser.profile_photo ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image 
                                                src={selectedUser.profile_photo} 
                                                alt={selectedUser.first_name}
                                                fill
                                                className="rounded-circle object-fit-cover"
                                                sizes="80px"
                                                onError={(e) => {
                                                    // Note: onError on Next/Image is limited for src replacement
                                                    // but we will keep this structure. Ideally state should change src.
                                                    // For now just suppress if this is causing issues, but trying Image is better.
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-primary fw-bold">
                                            {selectedUser.first_name ? selectedUser.first_name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="mb-1">{selectedUser.first_name} {selectedUser.last_name}</h4>
                                    <p className="text-muted mb-0">{selectedUser.email}</p>
                                    <p className="text-muted mb-0">{selectedUser.phone_number || 'No phone number'}</p>
                                </div>
                            </div>

                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Select 
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="admin">Admin</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select 
                                            value={editForm.is_active ? 'true' : 'false'}
                                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h5 className="mb-3 border-bottom pb-2">Addresses ({userAddresses.length})</h5>
                            {userAddresses.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {userAddresses.map((addr) => (
                                        <Card key={addr.id} className={`border ${addr.is_default ? 'border-primary bg-light' : ''}`}>
                                            <Card.Body>
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <strong>{addr.address_type || 'Home'}</strong>
                                                        {addr.is_default && <Badge bg="primary" className="ms-2">Default</Badge>}
                                                        <address className="mb-0 mt-2 text-muted">
                                                            {addr.address_line}<br />
                                                            {addr.city}, {addr.state_name} {addr.postal_code}<br />
                                                            {addr.country_name}
                                                        </address>
                                                    </div>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No addresses found for this user.</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateUser} disabled={modalLoading}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UsersTab;
