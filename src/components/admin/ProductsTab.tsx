"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Table, Button, Form, Modal } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { productApi, categoryApi } from '@/utils/api';
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify';
import MultipleImageUpload from './MultipleImageUpload';
import ProductAttributesManager from './ProductAttributesManager';
import KeyValueEditor from './KeyValueEditor';

interface ImageItem {
    id?: string;
    imagePath: string;
    isPrimary?: boolean;
    displayOrder?: number;
}

interface ProductAttribute {
    id?: string;
    attributeType?: string;
    attributeValue: string;
    price: number;
    oldPrice?: number;
    stockQuantity?: number;
    skuSuffix?: string;
    isDefault?: boolean;
    displayOrder?: number;
}

interface Product {
    id: string;
    title: string;
    sku: string;
    description: string;
    detailed_description?: string;
    product_details?: any;
    product_information?: any;
    category_id: string;
    category_name?: string;
    brand_id?: string;
    brand_name?: string;
    old_price: number;
    new_price: number;
    weight: string;
    stock_quantity: number;
    item_left: number;
    status: string;
    sale_tag: string;
    location: string;
    is_special?: boolean;
    is_combo?: boolean;
    primary_image: string;
    sequence?: number;
    images?: any[];
    attributes?: ProductAttribute[];
}

const ProductsTab = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '',
        sku: '',
        description: '',
        category_id: '',
        old_price: 0,
        new_price: 0,
        weight: '',
        stock_quantity: 0,
        item_left: 0,
        status: 'In Stock',
        sale_tag: '',
        location: 'In Store,online',
        is_special: false,
        is_combo: false,
        primary_image: '',
        sequence: 0,
    });
    const [productImages, setProductImages] = useState<ImageItem[]>([]);
    const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
    const [detailedDescription, setDetailedDescription] = useState('');
    const [productDetails, setProductDetails] = useState<any>(null);
    const [productInformation, setProductInformation] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll({
                page: currentPage,
                limit: 20,
                search: searchTerm || undefined,
            });
            
            // Handle both array response (old) and object with pagination (new)
            if (Array.isArray(response)) {
                setProducts(response);
                setTotalPages(1);
            } else if (response && response.products) {
                setProducts(response.products);
                setTotalPages(response.pagination?.totalPages || 1);
            } else {
                setProducts([]);
                setTotalPages(1);
            }
        } catch (error: any) {
            console.error('Error fetching products:', error);
            showErrorToast('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    const fetchCategories = useCallback(async () => {
        try {
            const cats = await categoryApi.getAll();
            setCategories(Array.isArray(cats) ? cats : []);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleAdd = () => {
        setEditingProduct(null);
        setFormData({
            title: '',
            sku: '',
            description: '',
            category_id: '',
            old_price: 0,
            new_price: 0,
            weight: '',
            stock_quantity: 0,
            item_left: 0,
            status: 'In Stock',
            sale_tag: '',
            location: 'In Store,online',
            is_special: false,
            is_combo: false,
            primary_image: '',
            sequence: 0,
        });
        setProductImages([]);
        setProductAttributes([]);
        setDetailedDescription('');
        setProductDetails(null);
        setProductInformation(null);
        setShowModal(true);
    };

    const handleEdit = async (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            sku: product.sku,
            description: product.description,
            category_id: product.category_id,
            old_price: product.old_price,
            new_price: product.new_price,
            weight: product.weight,
            stock_quantity: product.stock_quantity,
            item_left: product.item_left,
            status: product.status,
            sale_tag: product.sale_tag,
            location: product.location,
            is_special: product.is_special || false,
            is_combo: product.is_combo || false,
            primary_image: product.primary_image,
            sequence: product.sequence || 0,
        });
        
        // Fetch product details with images, attributes, and detailed info
        try {
            const productDetails = await productApi.getById(product.id);
            if (productDetails) {
                // Convert backend image format to frontend format
                if (productDetails.images && Array.isArray(productDetails.images)) {
                    const images: ImageItem[] = productDetails.images.map((img: any, index: number) => ({
                        id: img.id,
                        imagePath: img.image_url || img.imageUrl || '',
                        isPrimary: img.is_primary || img.isPrimary || false,
                        displayOrder: img.display_order || img.displayOrder || index,
                    }));
                    setProductImages(images);
                } else if (product.primary_image) {
                    setProductImages([{
                        imagePath: product.primary_image,
                        isPrimary: true,
                        displayOrder: 0,
                    }]);
                } else {
                    setProductImages([]);
                }

                // Set attributes
                if (productDetails.attributes && Array.isArray(productDetails.attributes)) {
                    const attributes: ProductAttribute[] = productDetails.attributes.map((attr: any) => ({
                        id: attr.id,
                        attributeType: attr.attribute_type || attr.attributeType || 'weight',
                        attributeValue: attr.attribute_value || attr.attributeValue || '',
                        price: parseFloat(attr.price || 0),
                        oldPrice: attr.old_price ? parseFloat(attr.old_price) : undefined,
                        stockQuantity: attr.stock_quantity || attr.stockQuantity || 0,
                        skuSuffix: attr.sku_suffix || attr.skuSuffix || '',
                        isDefault: attr.is_default || attr.isDefault || false,
                        displayOrder: attr.display_order || attr.displayOrder || 0,
                    }));
                    setProductAttributes(attributes);
                } else {
                    setProductAttributes([]);
                }

                // Set detailed description and info
                setDetailedDescription(productDetails.detailed_description || productDetails.detailedDescription || '');
                
                // Parse product details - can be object or JSON string
                let parsedDetails = productDetails.product_details || productDetails.productDetails || null;
                if (typeof parsedDetails === 'string' && parsedDetails.trim() !== '') {
                    try {
                        parsedDetails = JSON.parse(parsedDetails);
                    } catch (e) {
                        // If parsing fails, set to null
                        parsedDetails = null;
                    }
                }
                setProductDetails(parsedDetails);
                
                // Parse product information - can be object or JSON string
                let parsedInformation = productDetails.product_information || productDetails.productInformation || null;
                if (typeof parsedInformation === 'string' && parsedInformation.trim() !== '') {
                    try {
                        parsedInformation = JSON.parse(parsedInformation);
                    } catch (e) {
                        // If parsing fails, set to null
                        parsedInformation = null;
                    }
                }
                setProductInformation(parsedInformation);
            }
        } catch (error: any) {
            console.error('Error fetching product details:', error);
            setProductImages([]);
            setProductAttributes([]);
        }
        
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await adminApi.deleteProduct(id);
            showSuccessToast('Product deleted successfully');
            fetchProducts();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            showErrorToast('Failed to delete product');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Prepare images array for backend (only if images exist)
            let imagesArray: any[] = [];
            let primaryImage = formData.primary_image || '';
            
            if (productImages.length > 0) {
                imagesArray = productImages.map((img, index) => ({
                    url: img.imagePath,
                    isPrimary: img.isPrimary || index === 0,
                    displayOrder: img.displayOrder !== undefined ? img.displayOrder : index,
                }));
                
                // Get primary image path (first primary image or first image)
                primaryImage = productImages.find(img => img.isPrimary)?.imagePath || 
                              productImages[0].imagePath || 
                              formData.primary_image || '';
            }
            
            // Transform snake_case to camelCase for backend API
            const apiData: any = {
                title: formData.title,
                sku: formData.sku,
                description: formData.description || '',
                detailedDescription: detailedDescription || '',
                categoryId: formData.category_id || null,
                brandId: formData.brand_id || null,
                oldPrice: formData.old_price || 0,
                newPrice: formData.new_price || 0,
                weight: formData.weight || '',
                stockQuantity: formData.stock_quantity || 0,
                itemLeft: formData.item_left || formData.stock_quantity || 0,
                status: formData.status || 'In Stock',
                saleTag: formData.sale_tag || '',
                location: formData.location || 'In Store,online',
                isSpecial: formData.is_special || false,
                isCombo: formData.is_combo || false,
                sequence: formData.sequence || 0,
            };

            // Add product details and information (as JSON strings)
            // productDetails and productInformation are objects from KeyValueEditor
            if (productDetails && typeof productDetails === 'object') {
                apiData.productDetails = JSON.stringify(productDetails);
            } else if (productDetails && typeof productDetails === 'string') {
                // If it's already a string, use it as is
                apiData.productDetails = productDetails;
            }
            
            if (productInformation && typeof productInformation === 'object') {
                apiData.productInformation = JSON.stringify(productInformation);
            } else if (productInformation && typeof productInformation === 'string') {
                // If it's already a string, use it as is
                apiData.productInformation = productInformation;
            }
            
            // Only include primaryImage if we have one
            if (primaryImage) {
                apiData.primaryImage = primaryImage;
            }
            
            // Only include images array if we have images (for update, send empty array to clear)
            if (editingProduct || imagesArray.length > 0) {
                apiData.images = imagesArray;
            }

            // Include attributes if we have any
            if (productAttributes.length > 0) {
                apiData.attributes = productAttributes.map(attr => ({
                    attributeType: attr.attributeType || 'weight',
                    attributeValue: attr.attributeValue,
                    price: attr.price,
                    oldPrice: attr.oldPrice,
                    stockQuantity: attr.stockQuantity || 0,
                    skuSuffix: attr.skuSuffix || '',
                    isDefault: attr.isDefault || false,
                    displayOrder: attr.displayOrder !== undefined ? attr.displayOrder : 0,
                }));
            } else if (editingProduct) {
                // If editing and no attributes, send empty array to clear existing attributes
                apiData.attributes = [];
            }

            if (editingProduct) {
                await adminApi.updateProduct(editingProduct.id, apiData);
                showSuccessToast('Product updated successfully');
            } else {
                await adminApi.createProduct(apiData);
                showSuccessToast('Product created successfully');
            }
            setShowModal(false);
            setProductImages([]);
            setProductAttributes([]);
            setDetailedDescription('');
            setProductDetails(null);
            setProductInformation(null);
            fetchProducts();
        } catch (error: any) {
            console.error('Error saving product:', error);
            showErrorToast(error.message || 'Failed to save product');
        }
    };

    return (
        <div className="bb-admin-products">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <Row className="align-items-center mb-3">
                        <Col lg={6}>
                            <h5 className="mb-0">Products Management</h5>
                        </Col>
                        <Col lg={6} className="text-end">
                            <Button onClick={handleAdd} variant="primary" className="d-flex align-items-center gap-2 ms-auto">
                                <i className="ri-add-line"></i> Add Product
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <Form.Control
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-light border-0"
                            />
                        </Col>
                    </Row>
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading products...</p>
                        </div>
                    ) : (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 py-3 ps-4">ID</th>
                                    <th className="border-0 py-3">Title</th>
                                    <th className="border-0 py-3">SKU</th>
                                    <th className="border-0 py-3">Category</th>
                                    <th className="border-0 py-3">Price</th>
                                    <th className="border-0 py-3">Stock</th>
                                    <th className="border-0 py-3">Status</th>
                                    <th className="border-0 py-3 pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-5 text-muted">
                                            <i className="ri-shopping-bag-3-line fs-1 d-block mb-2"></i>
                                            {searchTerm ? 'No products found matching your search' : 'No products found'}
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="ps-4"><span className="text-muted">#{product.id.substring(0, 8)}...</span></td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {product.primary_image && (
                                                        <img 
                                                            src={product.primary_image} 
                                                            alt={product.title} 
                                                            className="rounded me-2"
                                                            style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                        />
                                                    )}
                                                    <span className="fw-medium text-truncate" style={{maxWidth: '200px'}} title={product.title}>
                                                        {product.title}
                                                    </span>
                                                </div>
                                            </td>
                                            <td><span className="badge bg-light text-dark fw-normal border">{product.sku}</span></td>
                                            <td>{product.category_name || '-'}</td>
                                            <td>
                                                <div className="d-flex flex-column">
                                                    <span className="fw-medium">₹{product.new_price}</span>
                                                    {product.old_price > product.new_price && (
                                                        <span className="text-decoration-line-through text-muted small">₹{product.old_price}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    (product.item_left || product.stock_quantity) > 10 ? 'bg-success bg-opacity-10 text-success' : 
                                                    (product.item_left || product.stock_quantity) > 0 ? 'bg-warning bg-opacity-10 text-warning' : 
                                                    'bg-danger bg-opacity-10 text-danger'
                                                } rounded-pill`}>
                                                    {product.item_left || product.stock_quantity} left
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    product.status === 'In Stock' ? 'bg-success' : 
                                                    product.status === 'Out of Stock' ? 'bg-danger' : 
                                                    'bg-secondary'
                                                } rounded-pill`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                    className="me-2 text-primary"
                                                    title="Edit"
                                                >
                                                    <i className="ri-edit-line"></i>
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
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
                </div>
            </div>

            {/* Product Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>SKU *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                        <option value="Discontinued">Discontinued</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Old Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={formData.old_price}
                                        onChange={(e) => setFormData({ ...formData, old_price: parseFloat(e.target.value) || 0 })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Price *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={formData.new_price}
                                        onChange={(e) => setFormData({ ...formData, new_price: parseFloat(e.target.value) || 0 })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Weight</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0, item_left: parseInt(e.target.value) || 0 })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <MultipleImageUpload
                            label="Product Images"
                            value={productImages}
                            onChange={setProductImages}
                            maxImages={10}
                        />
                        <ProductAttributesManager
                            label="Product Attributes (Weights/Sizes with Prices)"
                            value={productAttributes}
                            onChange={setProductAttributes}
                        />
                        <Form.Group className="mb-3">
                            <Form.Label>Detailed Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={detailedDescription}
                                onChange={(e) => setDetailedDescription(e.target.value)}
                                placeholder="Enter detailed product description..."
                            />
                        </Form.Group>
                        <KeyValueEditor
                            label="Product Details"
                            value={productDetails}
                            onChange={setProductDetails}
                            helpText="Add product specifications, features, and other details as key-value pairs (e.g., Weight: 500g, Features: Feature 1, Feature 2)"
                        />
                        <KeyValueEditor
                            label="Product Information"
                            value={productInformation}
                            onChange={setProductInformation}
                            helpText="Add additional product information like ingredients, shelf life, storage instructions, etc. as key-value pairs"
                        />
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sale Tag</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.sale_tag}
                                        onChange={(e) => setFormData({ ...formData, sale_tag: e.target.value })}
                                        placeholder="e.g., -20%"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
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
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Special Product"
                                        checked={formData.is_special}
                                        onChange={(e) => setFormData({ ...formData, is_special: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Combo Product"
                                        checked={formData.is_combo}
                                        onChange={(e) => setFormData({ ...formData, is_combo: e.target.checked })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            setProductImages([]);
                            setProductAttributes([]);
                            setDetailedDescription('');
                            setProductDetails(null);
                            setProductInformation(null);
                        }}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bb-btn-2">
                            {editingProduct ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsTab;

