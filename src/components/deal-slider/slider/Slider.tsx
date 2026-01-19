import fetcher from '@/components/fetcher/Fetcher'
import ProductItemCard from '@/components/item/ProductItemCard'
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col } from 'react-bootstrap'
import { Swiper, SwiperSlide } from 'swiper/react'
import useSWR from 'swr'

const Slider = ({
    productId,
    categoryId,
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}: {
    productId?: string;
    categoryId?: string;
    onSuccess?: () => void;
    hasPaginate?: boolean;
    onError?: () => void;
}) => {
    // If productId is provided, fetch related products, otherwise fetch deal products
    const apiUrl = productId ? "/api/related-products" : "/api/deal-slider";
    const apiParams = productId ? { productId, categoryId, limit: 8 } : {};
    
    const { data, error } = useSWR(
        [apiUrl, apiParams],
        ([url, params]) => fetcher(url, params),
        { onSuccess, onError }
    );

    if (error) {
        console.error("Error loading products:", error);
        // Return empty div instead of error message to maintain layout
        return <div className='col-12'></div>;
    }
    if (!data) {
        // Return empty div while loading
        return <div className='col-12'></div>;
    }

    const getData = () => {
        if (hasPaginate) {
            return Array.isArray(data.data) ? data.data : [];
        } else {
            // Ensure we always return an array
            if (Array.isArray(data)) {
                return data;
            } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                return data.data;
            }
            return [];
        }
    };
    
    const products = getData();
    
    if (products.length === 0) {
        // Don't show error message, just return empty div to maintain layout
        return <div className='col-12'></div>;
    }
    
    return (
        <div className='col-12'>
            <Swiper
                loop={products.length > 4}
                autoplay={{ delay: 1000 }} 
                slidesPerView={4}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                    },
                    480: {
                        slidesPerView: 1,
                    },
                    481: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1199: {
                        slidesPerView: 3,
                    },
                    1200: {
                        slidesPerView: 4,
                    },
                }}
                className="bb-deal-slider">
                <div className="bb-deal-block owl-carousel">
                    <Fade triggerOnce duration={1000} delay={200} direction='up'>
                        {products.map((data: any, index: any) => (
                            <SwiperSlide className="bb-deal-card" key={index}>
                                <ProductItemCard data={data} />
                            </SwiperSlide>
                        ))}
                    </Fade>
                </div>
            </Swiper>
        </div>
    )
}

export default Slider
