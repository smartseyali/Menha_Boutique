import React, { useEffect, useRef, useState } from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useSWR from 'swr';
import fetcher from '@/components/fetcher/Fetcher';
import ZoomProductImage from '../../zoom-product-img/ZoomProductImage';

const SingleProductSlider = ({
    productId,
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}: {
    productId?: string;
    onSuccess?: () => void;
    hasPaginate?: boolean;
    onError?: () => void;
}) => {
    const [isSliderInitialized, setIsSliderInitialized] = useState(false);
    const initialRef: Slider | null = null;
    const slider1 = useRef<Slider | null>(initialRef);
    const slider2 = useRef<Slider | null>(initialRef);


    const slider1Settings = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        asNavFor: slider2.current,
        focusOnSelect: true,
        vertical: false,
        infinite: false,
    };

    const slider2Settings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: slider1.current,
        dots: false,
        arrows: true,
        focusOnSelect: true,
        vertical: false,
        infinite: false,
        centerMode: false,
        variableWidth: false,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            }
        ]
    };

    const handleSlider1Click = (index: any) => {
        if (slider2.current) {
            slider2.current.slickGoTo(index);
        }
    };

    const handleSlider2Click = (index: any) => {
        if (slider1.current) {
            slider1.current.slickGoTo(index);
        }
    };

    // Fetch product images using productId
    const { data, error } = useSWR(
        productId ? ["/api/product-img", { productId: productId }] : null,
        ([url, params]) => fetcher(url, params),
        { onSuccess, onError }
    );

    useEffect(() => {
        setIsSliderInitialized(true);
        // Force slider re-initialization when data changes
        if (data && slider1.current && slider2.current) {
            setTimeout(() => {
                if (slider1.current) slider1.current.slickGoTo(0);
                if (slider2.current) slider2.current.slickGoTo(0);
            }, 100);
        }
    }, [data, isSliderInitialized]);

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>

    const getData = () => {
        if (hasPaginate) return data.data;
        else return data;
    };
    return (
        <>
            <div className="single-pro-slider">
                <Slider
                    {...slider1Settings}
                    ref={(slider) => {
                        slider1.current = slider;
                    }}
                    asNavFor={slider2.current || undefined}
                    className="single-product-cover">
                    {getData().map((image: any, index: any) => (
                        <div key={index} onClick={() => handleSlider1Click(index)} className="single-slide zoom-image-hover">
                            <ZoomProductImage 
                                className="img-responsive" 
                                src={image.image}
                                alt="product-1"
                                onError={(e: any) => {
                                    const target = e.target as HTMLImageElement;
                                    const defaultImage = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
                                    if (target.src !== defaultImage) {
                                        target.src = defaultImage;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </Slider>
                <div style={{ marginTop: '15px' }}>
                    <Slider
                        {...slider2Settings}
                        ref={(slider) => {
                            slider2.current = slider;
                        }}
                        asNavFor={slider1.current || undefined}
                        className="single-nav-thumb">
                        {getData().map((image: any, index: any) => (
                            <div key={index} onClick={() => handleSlider2Click(index)} className="single-slide" style={{ display: 'flex', justifyContent: 'center' }}>
                                <img 
                                    className="img-responsive" 
                                    src={image.image}
                                    alt={`product-${index + 1}`}
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        objectFit: 'cover',
                                        maxHeight: '100px'
                                    }}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        const defaultImage = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
                                        if (target.src !== defaultImage) {
                                            target.src = defaultImage;
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </>
    )
}

export default SingleProductSlider
