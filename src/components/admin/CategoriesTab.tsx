"use client";

import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { categoryApi } from '@/utils/api';
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    parent_id: string | null;
    sequence?: number;
    productCount?: number;
}

const CategoriesTab = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        slug: '',
        description: '',
        image: '',
        parent_id: null,
        sequence: 0,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const cats = await categoryApi.getAll();
            setCategories(Array.isArray(cats) ? cats : []);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            showErrorToast('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            image: '',
            parent_id: null,
            sequence: 0,
        });
        setShowModal(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            image: category.image || '',
            parent_id: category.parent_id,
            sequence: category.sequence || 0,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        const category = categories.find(cat => cat.id === id);
        const categoryName = category?.name || 'this category';
        const productCount = category?.productCount || 0;
        
        // Warn if category has products
        if (productCount > 0) {
            if (!window.confirm(
                `Warning: "${categoryName}" has ${productCount} product(s). ` +
                `Deleting this category will fail. Do you want to continue?`
            )) {
                return;
            }
        } else {
            if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
                return;
            }
        }

        try {
            await adminApi.deleteCategory(id);
            showSuccessToast('Category deleted successfully');
            fetchCategories(); // Refresh the list
        } catch (error: any) {
            console.error('Error deleting category:', error);
            showErrorToast(error.message || 'Failed to delete category');
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Generate slug from name if not provided
            const slug = formData.slug || generateSlug(formData.name || '');
            const submitData = { ...formData, slug };

            if (editingCategory) {
                await adminApi.updateCategory(editingCategory.id, submitData);
                showSuccessToast('Category updated successfully');
            } else {
                await adminApi.createCategory(submitData);
                showSuccessToast('Category created successfully');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error: any) {
            console.error('Error saving category:', error);
            showErrorToast(error.message || 'Failed to save category');
        }
    };

    return (
        <div className="bb-admin-categories">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="mb-0">Categories Management</h5>
                        </Col>
                        <Col className="text-end">
                            <Button onClick={handleAdd} variant="primary" className="d-flex align-items-center gap-2 ms-auto">
                                <i className="ri-add-line"></i> Add Category
                            </Button>
                        </Col>
                    </Row>
                </div>
                
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading categories...</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 py-3 ps-4">ID</th>
                                    <th className="border-0 py-3">Name</th>
                                    <th className="border-0 py-3">Sequence</th>
                                    <th className="border-0 py-3">Slug</th>
                                    <th className="border-0 py-3">Description</th>
                                    <th className="border-0 py-3">Products</th>
                                    <th className="border-0 py-3 pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <i className="ri-folder-open-line fs-1 d-block mb-2"></i>
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id}>
                                            <td className="ps-4"><span className="text-muted">#{category.id.substring(0, 8)}...</span></td>
                                            <td className="fw-medium">{category.name}</td>
                                            <td>{category.sequence || 0}</td>
                                            <td><span className="badge bg-light text-dark fw-normal border">{category.slug}</span></td>
                                            <td className="text-muted small text-truncate" style={{maxWidth: '200px'}}>{category.description || '-'}</td>
                                            <td>
                                                <span className={`badge ${category.productCount ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} rounded-pill`}>
                                                    {category.productCount || 0} items
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                    className="me-2 text-primary"
                                                    title="Edit"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleDelete(category.id)}
                                                    className="text-danger"
                                                    title="Delete"
                                                >
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

            {/* Category Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{editingCategory ? 'Edit Category' : 'Add New Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g. Traditional Rice"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                                slug: formData.slug || generateSlug(e.target.value),
                                            });
                                        }}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Slug</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="Auto-generated from name"
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">Unique identifier for URL</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sequence (Order)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.sequence}
                                        onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                    <Form.Text className="text-muted">Lower numbers appear first</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Parent Category</Form.Label>
                                    <Form.Select
                                        value={formData.parent_id || ''}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                                    >
                                        <option value="">None (Top Level Category)</option>
                                        {categories
                                            .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Category description..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category Image</Form.Label>
                                    <div className="d-flex gap-2 mb-2">
                                        <Form.Control
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="Image URL or Upload Image"
                                        />
                                        <div className="position-relative">
                                            <Button variant="outline-primary" className="text-nowrap">
                                                <i className="ri-upload-cloud-line me-1"></i> Upload
                                            </Button>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                className="position-absolute top-0 start-0 opacity-0 w-100 h-100"
                                                style={{ cursor: 'pointer' }}
                                                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const files = e.target.files;
                                                    if (files && files.length > 0) {
                                                        const file = files[0];
                                                        const formDataUpload = new FormData();
                                                        formDataUpload.append('image', file);

                                                        try {
                                                            const response = await adminApi.uploadImage(formDataUpload);
                                                            // Construct full URL if returned path is relative
                                                            const imagePath = response.imagePath;
                                                            const fullUrl = imagePath.startsWith('http') 
                                                                ? imagePath 
                                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}${imagePath}`;
                                                            
                                                            setFormData(prev => ({ ...prev, image: fullUrl }));
                                                            showSuccessToast('Image uploaded successfully');
                                                        } catch (error: any) {
                                                            console.error('Upload failed:', error);
                                                            showErrorToast(error.message || 'Image upload failed');
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                        {formData.image && (
                            <div className="mt-2 p-2 border rounded text-center bg-light">
                                <img src={formData.image} alt="Preview" style={{maxHeight: '100px', objectFit: 'contain'}} />
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingCategory ? 'Update Category' : 'Create Category'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesTab;

