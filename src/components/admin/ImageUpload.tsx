"use client";

import React, { useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';

interface ImageUploadProps {
  value?: string;
  onChange: (imagePath: string) => void;
  label?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  label = 'Product Image',
  required = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  React.useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminApi.uploadImage(formData);
      
      if (response.imagePath) {
        onChange(response.imagePath);
        showSuccessToast('Image uploaded successfully');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showErrorToast(error.message || 'Failed to upload image');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      {preview && (
        <div className="mb-3">
          <img 
            src={preview} 
            alt="Preview" 
            style={{ 
              maxWidth: '200px', 
              maxHeight: '200px', 
              objectFit: 'cover',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '4px'
            }} 
          />
        </div>
      )}

      <div className="d-flex gap-2 align-items-center">
        <Form.Control
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
          id={`image-upload-${label.replace(/\s+/g, '-')}`}
        />
        <label htmlFor={`image-upload-${label.replace(/\s+/g, '-')}`}>
          <Button
            variant="outline-primary"
            as="span"
            disabled={uploading}
            size="sm"
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Uploading...
              </>
            ) : (
              <>
                <i className="ri-upload-line me-1"></i>
                {preview ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Button>
        </label>
        
        {preview && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <i className="ri-delete-bin-line me-1"></i>
            Remove
          </Button>
        )}
      </div>

      {value && !preview && (
        <div className="mt-2">
          <small className="text-muted">Current image: {value}</small>
        </div>
      )}

      <Form.Text className="text-muted">
        Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
      </Form.Text>
    </Form.Group>
  );
};

export default ImageUpload;

