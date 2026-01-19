"use client"
import React, { useState, useEffect } from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from './slider/Slider'
import { Row } from 'react-bootstrap'
import useSWR from 'swr'
import fetcher from '@/components/fetcher/Fetcher'
import { productApi } from '@/utils/api'

const RelatedSlider = ({ productId }: { productId?: string }) => {
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

    // Fetch product to get category for related products
    useEffect(() => {
        const fetchProductCategory = async () => {
            if (productId) {
                try {
                    const product = await productApi.getById(productId);
                    if (product?.category_id) {
                        setCategoryId(product.category_id);
                    }
                } catch (error) {
                    console.error("Error fetching product category:", error);
                }
            }
        };
        fetchProductCategory();
    }, [productId]);

    return (
        <>
            <section className="section-deal padding-tb-50">
                <div className="container">
                    <Row>
                        <div className="col-12">
                            <Fade triggerOnce direction='up' duration={1000} delay={200} >
                                <div className="section-title bb-center">
                                    <div className="section-detail">
                                        <h2 className="bb-title">Related <span>Product</span></h2>
                                        <p>Browse The Collection of Top Products.</p>
                                    </div>
                                </div>
                            </Fade>
                        </div>
                        <Slider productId={productId} categoryId={categoryId} />
                    </Row>
                </div>
            </section>
        </>
    )
}

export default RelatedSlider
