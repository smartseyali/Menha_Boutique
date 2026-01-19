
import React, { useState, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
// Toastify util is at ../toast-popup/Toastify in the new structure as well
// file path: src/components/admin/ProductAttributesManager.tsx
// Toastify path: src/components/toast-popup/Toastify.tsx
import { showErrorToast } from '../toast-popup/Toastify';

export interface ProductAttribute {
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

interface ProductAttributesManagerProps {
  value?: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
  label?: string;
}

const ProductAttributesManager: React.FC<ProductAttributesManagerProps> = ({
  value = [],
  onChange,
  label = 'Product Attributes (Weights/Sizes)',
}) => {
  const [attributes, setAttributes] = useState<ProductAttribute[]>(value || []);

  useEffect(() => {
    if (value && value.length > 0) {
      setAttributes(value);
    }
  }, [value]);

  const handleAddAttribute = () => {
    const newAttribute: ProductAttribute = {
      attributeType: 'weight', // Default type, can be changed later if we add type selection
      attributeValue: '',
      price: 0,
      oldPrice: 0,
      stockQuantity: 0,
      skuSuffix: '',
      isDefault: attributes.length === 0,
      displayOrder: attributes.length,
    };
    const updatedAttributes = [...attributes, newAttribute];
    setAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    // Update display orders
    updatedAttributes.forEach((attr, i) => {
      attr.displayOrder = i;
    });
    setAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  const handleUpdateAttribute = (index: number, field: keyof ProductAttribute, value: any) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value,
    };
    
    // If setting as default, unset all other defaults
    if (field === 'isDefault' && value === true) {
      updatedAttributes.forEach((attr, i) => {
        if (i !== index) {
          attr.isDefault = false;
        }
      });
    }
    
    setAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedAttributes = [...attributes];
    [updatedAttributes[index - 1], updatedAttributes[index]] = [updatedAttributes[index], updatedAttributes[index - 1]];
    updatedAttributes.forEach((attr, i) => {
      attr.displayOrder = i;
    });
    setAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  const handleMoveDown = (index: number) => {
    if (index === attributes.length - 1) return;
    const updatedAttributes = [...attributes];
    [updatedAttributes[index], updatedAttributes[index + 1]] = [updatedAttributes[index + 1], updatedAttributes[index]];
    updatedAttributes.forEach((attr, i) => {
      attr.displayOrder = i;
    });
    setAttributes(updatedAttributes);
    onChange(updatedAttributes);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      
      {attributes.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="mt-2 text-center align-middle">
            <thead className="bg-light">
              <tr>
                <th style={{ width: '20%' }}>Weight/Size</th>
                <th style={{ width: '15%' }}>Price</th>
                <th style={{ width: '15%' }}>Old Price</th>
                <th style={{ width: '10%' }}>Stock</th>
                <th style={{ width: '15%' }}>SKU Suffix</th>
                <th style={{ width: '5%' }}>Def.</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={attr.attributeValue}
                      onChange={(e) => handleUpdateAttribute(index, 'attributeValue', e.target.value)}
                      placeholder="e.g. 1kg"
                      required
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={attr.price}
                      onChange={(e) => handleUpdateAttribute(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      step="0.01"
                      value={attr.oldPrice || ''}
                      onChange={(e) => handleUpdateAttribute(index, 'oldPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      value={attr.stockQuantity || 0}
                      onChange={(e) => handleUpdateAttribute(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={attr.skuSuffix || ''}
                      onChange={(e) => handleUpdateAttribute(index, 'skuSuffix', e.target.value)}
                      placeholder="-1kg"
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="radio"
                      name="defaultAttribute"
                      checked={attr.isDefault || false}
                      onChange={(e) => handleUpdateAttribute(index, 'isDefault', e.target.checked)}
                      title="Set as default"
                      className="d-flex justify-content-center"
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move up"
                        className="p-1"
                      >
                        <i className="ri-arrow-up-line"></i>
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === attributes.length - 1}
                        title="Move down"
                        className="p-1"
                      >
                        <i className="ri-arrow-down-line"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveAttribute(index)}
                        title="Remove"
                        className="p-1"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleAddAttribute}
        className="mt-2"
      >
        <i className="ri-add-line"></i> Add Weight/Size
      </Button>
    </Form.Group>
  );
};

export default ProductAttributesManager;
