"use client";
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap'
import { bannerApi } from '@/utils/api'

interface Banner {
    id: string;
    image_url: string;
    link?: string;
    sequence: number;
}

const BannerOne = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data: any = await bannerApi.getAll({ type: 'section' }); 
                if (Array.isArray(data) && data.length > 0) {
                    setBanners(data);
                }
            } catch (error) {
                console.error("Failed to fetch banners", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading) {
         return <div className="text-center py-5">Loading...</div>;
    }

    if (banners.length === 0) {
        // Fallback to original hardcoded banners if no dynamic banners exist
        return (
            <section className="section-banner-one padding-tb-50">
                <div className="container">
                    <Row className="mb-minus-24">
                        <Col lg={6} className="mb-24 col-12">
                            <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                <Link href="/combos">
                                    <img src="/assets/img/banner-one/one1.png" alt="one" className="w-100" />
                                </Link>
                            </Fade>
                        </Col>
                        <Col lg={6} className="mb-24 col-12">
                            <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                <img src="/assets/img/banner-one/two2.png" alt="two" className="w-100" />
                            </Fade>
                        </Col>
                    </Row>
                </div>
            </section>
        );
    }

    return (
        <section className="section-banner-one padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24">
                    {banners.map((banner, index) => (
                        <Col lg={6} className="mb-24 col-12" key={banner.id}>
                            <Fade triggerOnce direction='up' duration={1000} delay={400 + (index * 100)}>
                                {banner.link ? (
                                    <Link href={banner.link}>
                                        <img src={banner.image_url} alt="banner" className="w-100" style={{borderRadius: '15px'}} />
                                    </Link>
                                ) : (
                                    <img src={banner.image_url} alt="banner" className="w-100" style={{borderRadius: '15px'}} />
                                )}
                            </Fade>
                        </Col>
                    ))}
                </Row>
            </div>
        </section>        
    )
}

export default BannerOne
