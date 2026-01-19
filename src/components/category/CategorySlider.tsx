"use client";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import "swiper/css";
import Link from 'next/link';
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';

const CategorySlider = () => {
    const { data: categoriesData, error } = useSWR('/api/category-slider', fetcher);
    
    // Ensure data is an array
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    
    if (!categories || categories.length === 0) return null;

    return (
        <section className="section-category-slider padding-tb-50">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center mb-30">
                            <div className="section-detail">
                                <h2 className="bb-title">Top <span>Categories</span></h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <Swiper
                            modules={[Autoplay]}
                            loop={true}
                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                            slidesPerView={6}
                            spaceBetween={24}
                            breakpoints={{
                                0: {
                                    slidesPerView: 2,
                                    spaceBetween: 15
                                },
                                480: {
                                    slidesPerView: 2,
                                    spaceBetween: 15
                                },
                                768: {
                                    slidesPerView: 3,
                                    spaceBetween: 20
                                },
                                991: {
                                    slidesPerView: 4,
                                    spaceBetween: 24
                                },
                                1200: {
                                    slidesPerView: 6,
                                    spaceBetween: 24
                                },
                            }}
                            className="category-slider"
                        >
                            {categories.map((cat) => (
                                <SwiperSlide key={cat.id}>
                                    <div className="category-slide-item">
                                        <Link href={`/category/${cat.name}`} className="d-block text-center">
                                            <div 
                                                className="category-image-circle mx-auto mb-3"
                                                style={{
                                                    width: '125px',
                                                    height: '125px',
                                                    borderRadius: '50%',
                                                    overflow: 'hidden',
                                                    border: '2px solid #eee',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <img 
                                                    src={cat.image || '/assets/img/category/category.jpg'} 
                                                    alt={cat.name} 
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </div>
                                            <h4 className="category-name" style={{ fontSize: '16px', fontWeight: '700', color: '#3d4750' }}>{cat.name}</h4>
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategorySlider;
