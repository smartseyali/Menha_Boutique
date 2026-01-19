"use client"
import React from 'react'
import ProductsDetails from './Products-Detail/ProductsDetails'
import ProductsTabs from './Products-Tabs/ProductsTabs'
import { Col } from 'react-bootstrap'

const ProductFullwidth = ({ productId }: { productId?: string }) => {
    const handleReviewCreated = () => {
        // Trigger refresh of product data in ProductsDetails
        // The ProductsDetails component will listen for the custom event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('reviewCreated', { detail: { productId } }));
        }
    };

    return (
        <Col sm={12}>
            <ProductsDetails productId={productId} />
            <ProductsTabs productId={productId} onReviewCreated={handleReviewCreated} />
        </Col>
    )
}

export default ProductFullwidth
