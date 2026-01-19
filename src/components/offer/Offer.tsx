"use client"
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import fetcher from '../fetcher/Fetcher';
import useSWR from 'swr';
import OfferDealSlider from '../deal-slider/OfferDealSlider';
import ProductCard from './offer-itemcard/ProductCard';
import { Row } from 'react-bootstrap';

const Offer = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}) => {
    const { data, error } = useSWR("/api/offer", fetcher, { onSuccess, onError });

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>


    const getData = () => {
        if (hasPaginate) return data.data;
        else return data;
    };

    return (
        <>
            <section className="section-offer padding-tb-50">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center" data-aos="fade-up" data-aos-duration="1000"
                                data-aos-delay="200">
                                <div className="section-detail">
                                    <h2 className="bb-title">Best<span> Offer</span></h2>
                                    <p>check latest offers for you.</p>
                                </div>
                            </Fade>
                        </div>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="col-xl-3 col-md-4 col-6 mb-24 bb-product-box">
                            {getData().map((data: any, index: any) => (
                                <ProductCard data={data} key={index} />
                            ))}
                        </Fade>
                    </Row>
                </div>
            </section>
            <OfferDealSlider />
        </>
    )
}

export default Offer
