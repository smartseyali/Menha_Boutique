"use client";

import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify';

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    link?: string;
    type: 'main' | 'section' | 'popup' | 'video';
    sequence: number;
    is_active: boolean;
}

const BannersTab = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState<Partial<Banner>>({
        title: '',
        subtitle: '',
        image_url: '',
        link: '',
        type: 'main',
        sequence: 0,
        is_active: true,
    });
    const [filterType, setFilterType] = useState<string>('');

    useEffect(() => {
        fetchBanners();
    }, [filterType]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filterType) params.type = filterType;
            const data = await adminApi.getBanners(params);
            setBanners(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error fetching banners:', error);
            showErrorToast('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            subtitle: '',
            image_url: '',
            link: '',
            type: 'main',
            sequence: 0,
            is_active: true,
        });
        setShowModal(true);
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            image_url: banner.image_url,
            link: banner.link || '',
            type: banner.type,
            sequence: banner.sequence || 0,
            is_active: banner.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await adminApi.deleteBanner(id);
            showSuccessToast('Banner deleted successfully');
            fetchBanners();
        } catch (error: any) {
            console.error('Error deleting banner:', error);
            showErrorToast(error.message || 'Failed to delete banner');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBanner) {
                await adminApi.updateBanner(editingBanner.id, formData);
                showSuccessToast('Banner updated successfully');
            } else {
                await adminApi.createBanner(formData);
                showSuccessToast('Banner created successfully');
            }
            setShowModal(false);
            fetchBanners();
        } catch (error: any) {
            console.error('Error saving banner:', error);
            showErrorToast(error.message || 'Failed to save banner');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const formDataUpload = new FormData();
            formDataUpload.append('image', file); // Use 'image' field as expected by backend

            try {
                const response = await adminApi.uploadImage(formDataUpload);
                const imagePath = response.imagePath;
                setFormData(prev => ({ ...prev, image_url: imagePath }));
                showSuccessToast('File uploaded successfully');
            } catch (error: any) {
                console.error('Upload failed:', error);
                showErrorToast(error.message || 'Upload failed');
            }
        }
    };

    return (
        <div className="bb-admin-banners">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h5 className="mb-0">Banners & Videos Management</h5>
                        </Col>
                        <Col md={6} className="text-end d-flex gap-2 justify-content-end">
                            <Form.Select 
                                style={{ width: 'auto' }} 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="main">Main Slider</option>
                                <option value="section">Section Banner</option>
                                <option value="popup">Popup</option>
                                <option value="video">Shoppable Video</option>
                            </Form.Select>
                            <Button onClick={handleAdd} variant="primary">
                                <i className="ri-add-line me-1"></i> Add New
                            </Button>
                        </Col>
                    </Row>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Preview</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Sequence</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">No banners found</td>
                                    </tr>
                                ) : (
                                    banners.map((banner) => (
                                        <tr key={banner.id}>
                                            <td className="ps-4">
                                                {banner.type === 'video' || banner.image_url.endsWith('.mp4') ? (
                                                     <video src={banner.image_url} style={{height: '50px', width: '80px', objectFit: 'cover', borderRadius: '4px'}} muted />
                                                ) : (
                                                    <img src={banner.image_url} alt={banner.title} style={{height: '50px', width: '80px', objectFit: 'cover', borderRadius: '4px'}} />
                                                )}
                                            </td>
                                            <td>{banner.title}</td>
                                            <td><Badge bg="info">{banner.type}</Badge></td>
                                            <td>{banner.sequence}</td>
                                            <td>
                                                <Badge bg={banner.is_active ? 'success' : 'secondary'}>
                                                    {banner.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button variant="light" size="sm" onClick={() => handleEdit(banner)} className="me-2 text-primary">
                                                    <i className="ri-edit-line"></i>
                                                </Button>
                                                <Button variant="light" size="sm" onClick={() => handleDelete(banner.id)} className="text-danger">
                                                    <i className="ri-delete-bin-line"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                                    <Form.Select 
                                        value={formData.type} 
                                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                        required
                                    >
                                        <option value="main">Main Slider</option>
                                        <option value="section">Section Banner</option>
                                        <option value="popup">Popup</option>
                                        <option value="video">Shoppable Video</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sequence</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        value={formData.sequence} 
                                        onChange={(e) => setFormData({...formData, sequence: parseInt(e.target.value) || 0})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.title} 
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        required
                                        placeholder="Banner Title or Video Name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Subtitle</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.subtitle} 
                                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                        placeholder="Optional subtitle"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Link / URL</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={formData.link} 
                                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                                        placeholder="Target URL when clicked (optional)"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Media (Image or Video) <span className="text-danger">*</span></Form.Label>
                                    <div className="d-flex gap-2 mb-2">
                                        <Form.Control 
                                            type="text" 
                                            value={formData.image_url} 
                                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                            required
                                            placeholder="URL or Upload"
                                        />
                                        <div className="position-relative">
                                            <Button variant="outline-primary" className="text-nowrap">
                                                <i className="ri-upload-cloud-line me-1"></i> Upload
                                            </Button>
                                            <Form.Control 
                                                type="file" 
                                                className="position-absolute top-0 start-0 opacity-0 w-100 h-100" 
                                                style={{cursor: 'pointer'}}
                                                onChange={handleUpload}
                                                accept="image/*,video/*"
                                            />
                                        </div>
                                    </div>
                                    {formData.image_url && (
                                        <div className="mt-2 p-2 border rounded bg-light text-center">
                                            {formData.type === 'video' || formData.image_url.endsWith('.mp4') ? (
                                                <video src={formData.image_url} controls style={{maxHeight: '200px', maxWidth: '100%'}} />
                                            ) : (
                                                <img src={formData.image_url} alt="Preview" style={{maxHeight: '200px', maxWidth: '100%', objectFit: 'contain'}} />
                                            )}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Check 
                                    type="switch"
                                    id="is-active-switch"
                                    label="Active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">{editingBanner ? 'Update' : 'Create'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default BannersTab;
