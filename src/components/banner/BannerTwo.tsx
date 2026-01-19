"use client";
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { bannerApi } from '@/utils/api';
import Link from 'next/link';

const NextArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`custom-slick-arrow custom-slick-next ${className}`}
            style={{ ...style }}
            onClick={onClick}
        >
             <i className="ri-arrow-right-s-line"></i>
        </div>
    );
}

const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={`custom-slick-arrow custom-slick-prev ${className}`}
            style={{ ...style }}
            onClick={onClick}
        >
            <i className="ri-arrow-left-s-line"></i>
        </div>
    );
}

interface Banner {
    id: string;
    image_url: string;
    link?: string;
    sequence: number;
    title?: string;
}

const BannerTwo = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data: any = await bannerApi.getAll({ type: 'main' });
                if (Array.isArray(data) && data.length > 0) {
                    setBanners(data);
                }
            } catch (error) {
                console.error("Failed to fetch main banners", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        className: "banner-two-slider"
    };

    // Fallback images if no banners are returned from API
    const fallbackImages = [
        {
            desktop: '/assets/img/banner-two/banner.jpg', 
            mobile: '/assets/img/banner-two/banner_mobile.jpg'
        },
        { 
            desktop: '/assets/img/banner-two/banner1.jpg', 
            mobile: '/assets/img/banner-two/banner_mobile1.jpg' 
        },
        { 
            desktop: '/assets/img/banner-two/banner3.jpg', 
            mobile: '/assets/img/banner-two/banner_mobile2.jpg' 
        }
    ];

    if (loading) {
        return <div className="text-center py-5">Loading...</div>;
    }

    if (banners.length === 0) {
        return (
            <section className="section-banner-two">
                <div className="banner-container">
                    <Slider {...settings}>
                        {fallbackImages.map((img, index) => (
                            <div key={index} className="banner-slide-item">
                                <div 
                                    className="banner-image-bg banner-desktop-view" 
                                    style={{ backgroundImage: `url(${img.desktop})` }}
                                >
                                </div>
                                <div 
                                    className="banner-image-bg banner-mobile-view" 
                                    style={{ 
                                        backgroundImage: `url(${img.mobile})`,
                                        backgroundPosition: 'center top'
                                    }}
                                >
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </section>
        );
    }

    return (
        <section className="section-banner-two">
            <div className="banner-container">
                <Slider {...settings}>
                    {banners.map((banner) => (
                        <div key={banner.id} className="banner-slide-item">
                            {banner.link ? (
                                <Link href={banner.link} className="d-block w-100 h-100">
                                    <div 
                                        className="banner-image-bg banner-desktop-view" 
                                        style={{ backgroundImage: `url(${banner.image_url})` }}
                                    >
                                    </div>
                                    <div 
                                        className="banner-image-bg banner-mobile-view" 
                                        style={{ 
                                            backgroundImage: `url(${banner.image_url})`, // Using same image for mobile for now
                                            backgroundPosition: 'center top'
                                        }}
                                    >
                                    </div>
                                </Link>
                            ) : (
                                <>
                                    <div 
                                        className="banner-image-bg banner-desktop-view" 
                                        style={{ backgroundImage: `url(${banner.image_url})` }}
                                    >
                                    </div>
                                    <div 
                                        className="banner-image-bg banner-mobile-view" 
                                        style={{ 
                                            backgroundImage: `url(${banner.image_url})`, // Using same image for mobile for now
                                            backgroundPosition: 'center top'
                                        }}
                                    >
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    )
}

export default BannerTwo;
