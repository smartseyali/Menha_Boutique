"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Modal } from 'react-bootstrap';
import "swiper/css";
import "swiper/css/navigation";

import { bannerApi } from '@/utils/api';

const QuinnShoppableVideo = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentVideo, setCurrentVideo] = useState("");
    const [videos, setVideos] = useState<string[]>([
        "/assets/videos/IMG_0814.MP4",
        "/assets/videos/IMG_0815.MP4",
        "/assets/videos/IMG_0816.MP4"
    ]);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data: any = await bannerApi.getAll({ type: 'video' });
                if (Array.isArray(data) && data.length > 0) {
                    setVideos(data.map((item: any) => item.image_url));
                }
            } catch (error) {
                console.error("Error loading videos", error);
            }
        };
        fetchVideos();
    }, []);

    const handleVideoClick = (videoSrc: string) => {
        setCurrentVideo(videoSrc);
        setShowModal(true);
    };

    return (
        <section className="section-quinn padding-tb-50">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="section-title text-center mb-30">
                            <h3 className="bb-title">Shop By Videos</h3>
                        </div>
                        <div className="quinn-video-slider">
                            <Swiper
                                modules={[Autoplay, Navigation]}
                                spaceBetween={20}
                                slidesPerView={4}
                                navigation={true}
                                centerInsufficientSlides={true}
                                breakpoints={{
                                    320: {
                                        slidesPerView: 2,
                                        spaceBetween: 10,
                                    },
                                    576: {
                                        slidesPerView: 2,
                                        spaceBetween: 20,
                                    },
                                    992: {
                                        slidesPerView: 3,
                                        spaceBetween: 20,
                                    },
                                    1200: {
                                        slidesPerView: 4,
                                        spaceBetween: 20,
                                    }
                                }}
                                className="quinn-swiper"
                            >
                                {videos.map((videoSrc, index) => (
                                    <SwiperSlide key={index}>
                                        <div 
                                            className="video-card"
                                            onClick={() => handleVideoClick(videoSrc)}
                                            style={{
                                                borderRadius: '15px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                                aspectRatio: '9/16',
                                                position: 'relative',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <video
                                                src={videoSrc}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>

            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered 
                size="lg"
                contentClassName="bg-transparent border-0"
            >
                <Modal.Body className="p-0 position-relative" style={{ backgroundColor: 'transparent' }}>
                    <button 
                        type="button" 
                        className="btn-close btn-close-white position-absolute top-0 end-0 m-3" 
                        aria-label="Close" 
                        onClick={() => setShowModal(false)} 
                        style={{ zIndex: 10, filter: 'invert(1)' }}
                    ></button>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', backgroundColor: 'transparent' }}>
                        <video 
                            src={currentVideo} 
                            muted={false}
                            autoPlay 
                            style={{ width: '100%', maxHeight: '80vh', display: 'block' }} 
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </section>
    );
};

export default QuinnShoppableVideo;
