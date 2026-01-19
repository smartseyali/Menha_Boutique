"use client"
import React from 'react'
import { Fade } from 'react-awesome-reveal';
import fetcher from '../fetcher/Fetcher';
import useSWR from 'swr';
import ProductItemCard from '../item/ProductItemCard';
import { Row } from 'react-bootstrap';

const NewArrivals = ({
    onSuccess = () => { },
    onError = () => { },
}) => {

    const { data: productsData, error: productsError } = useSWR("/api/all-product?limit=1000", fetcher, { onSuccess, onError });

    if (productsError) {
        console.error("Error loading products:", productsError);
        return (
            <section className="section-product-tabs padding-tb-50">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <p>No products available at the moment.</p>
                            </div>
                        </div>
                    </Row>
                </div>
            </section>
        );
    }

    if (!productsData) return <div></div>
    
    // Ensure data is an array
    const products = Array.isArray(productsData) ? productsData : [];

    return (
        <section className="section-product-tabs padding-tb-50">
            <div className="container">
                <Row>
                    <div className='col-12'>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} >
                            <div className="section-title bb-deal">
                                <div className="section-detail">
                                    <h2 className="bb-title">Our <span>Products</span></h2>
                                    <p>Shop online and get fresh products!</p>
                                </div>
                            </div>
                        </Fade>
                    </div>
                </Row>
                <Row className="mb-minus-24">
                        {products.map((data: any, index: any) => (
                            <div className="col-xl-3 col-md-4 col-6 mb-24" key={index}>
                                <Fade triggerOnce direction='up' duration={1000} delay={200}>
                                    <ProductItemCard data={data} />
                                </Fade>
                            </div>
                        ))}
                </Row>
            </div>
        </section>
    )
}

export default NewArrivals
