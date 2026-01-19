"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { adminApi } from '@/utils/adminApi';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';
import { getImageUrl } from '@/utils/api';

interface ImageItem {
  id?: string;
  imagePath: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

interface MultipleImageUploadProps {
  value?: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  label?: string;
  maxImages?: number;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({ 
  value = [], 
  onChange, 
  label = 'Product Images',
  maxImages = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<ImageItem[]>(value || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update images when value prop changes
  useEffect(() => {
    if (value && value.length > 0) {
      setImages(value);
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      showErrorToast(`Maximum ${maxImages} images allowed. Please remove some images first.`);
      return;
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const filesArray = Array.from(files);
    
    for (const file of filesArray) {
      if (!allowedTypes.includes(file.type)) {
        showErrorToast(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, or WebP are allowed.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`Image ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
    }

    // Upload all files at once using uploadMultipleImages
    setUploading(true);
    const newImages: ImageItem[] = [...images];
    
    try {
      // Create FormData with all files
      const formData = new FormData();
      filesArray.forEach((file) => {
        formData.append('images', file); // Use 'images' (plural) for multiple upload
      });

      console.log('Uploading multiple images:', filesArray.length, 'files');
      const response = await adminApi.uploadMultipleImages(formData);
      
      if (response.images && Array.isArray(response.images)) {
        response.images.forEach((img: any, index: number) => {
          const newImage: ImageItem = {
            imagePath: img.imagePath || img.url || img.path,
            isPrimary: newImages.length === 0 && index === 0, // First image is primary
            displayOrder: newImages.length,
          };
          newImages.push(newImage);
        });
        
        setImages(newImages);
        onChange(newImages);
        showSuccessToast(`${response.images.length} image(s) uploaded successfully`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showErrorToast(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      setUploadingIndex(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first remaining image primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    // Update display orders
    newImages.forEach((img, i) => {
      img.displayOrder = i;
    });
    setImages(newImages);
    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
    onChange(newImages);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    newImages.forEach((img, i) => {
      img.displayOrder = i;
    });
    setImages(newImages);
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    newImages.forEach((img, i) => {
      img.displayOrder = i;
    });
    setImages(newImages);
    onChange(newImages);
  };

  const getImageUrlWithBase = (imagePath: string) => {
    if (!imagePath) return '';
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label} {images.length > 0 && <span className="text-muted">({images.length}/{maxImages})</span>}
      </Form.Label>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <Row className="mb-3">
          {images.map((image, index) => (
            <Col md={4} sm={6} key={index} className="mb-3">
              <div
                style={{
                  border: image.isPrimary ? '3px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '8px',
                  position: 'relative',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden', borderRadius: '4px' }}>
                  <img
                    src={getImageUrlWithBase(image.imagePath)}
                    alt={`Product image ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
                    }}
                  />
                </div>
                
                {image.isPrimary && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Primary
                  </div>
                )}
                
                <div className="mt-2 d-flex gap-1 flex-wrap">
                  <Button
                    variant={image.isPrimary ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleSetPrimary(index)}
                    disabled={image.isPrimary}
                  >
                    <i className="ri-star-line"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <i className="ri-arrow-up-line"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                  >
                    <i className="ri-arrow-down-line"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            multiple
            style={{ display: 'none' }}
            id="multiple-image-upload"
          />
          <label htmlFor="multiple-image-upload">
            <Button
              variant="outline-primary"
              as="span"
              disabled={uploading}
              size="sm"
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading {uploadingIndex !== null ? `(${uploadingIndex + 1}...)` : '...'}
                </>
              ) : (
                <>
                  <i className="ri-upload-line me-1"></i>
                  Upload Images ({images.length}/{maxImages})
                </>
              )}
            </Button>
          </label>
        </div>
      )}

      <Form.Text className="text-muted">
        Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB per image. Maximum {maxImages} images.
        First image will be set as primary automatically.
      </Form.Text>
    </Form.Group>
  );
};

export default MultipleImageUpload;

