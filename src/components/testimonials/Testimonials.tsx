"use client"
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Row } from 'react-bootstrap';
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';

const Testimonials = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}) => {

    const { data, error } = useSWR("/api/testimonials", fetcher, { onSuccess, onError });

    const settings = {
        dots: false,
        infinite: true,
        nav: true,
        autoplay: false,
        arrows: false,
        speed: 2000,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 1,

                },
            },
            {
                breakpoint: 0,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>

    const getData = () => {
        if (hasPaginate) return data.data;
        else return data;
    };
    return (
        <>
            <section className="section-testimonials padding-tb-100 p-0-991">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            <Fade triggerOnce direction='up' duration={1000} delay={400} className="bb-testimonials">
                                <img src="/assets/img/testimonials/img-1.png" alt="testimonials-1" className="testimonials-img-1" />
                                <img src="/assets/img/testimonials/img-2.png" alt="testimonials-2" className="testimonials-img-2" />
                                <img src="/assets/img/testimonials/img-3.png" alt="testimonials-3" className="testimonials-img-3" />
                                <img src="/assets/img/testimonials/img-4.png" alt="testimonials-4" className="testimonials-img-4" />
                                <img src="/assets/img/testimonials/img-5.png" alt="testimonials-5" className="testimonials-img-5" />
                                <img src="/assets/img/testimonials/img-6.png" alt="testimonials-6" className="testimonials-img-6" />
                                <div className="inner-banner">
                                    <h4>Testimonials</h4>
                                </div>
                                <Slider {...settings} className="testimonials-slider ">
                                    {getData().map((data: any, index: any) => (
                                        <div key={index} className="bb-testimonials-inner">
                                            <Row >
                                                <Col md={4} className="d-none-767 col-12">
                                                    <div className="testimonials-image">
                                                        <img src={data.image} alt="testimonials" />
                                                    </div>
                                                </Col>
                                                <Col md={8} className='col-12'>
                                                    <div style={{ margin: "0 6px" }} className="testimonials-contact">
                                                        <div className="user">
                                                            <img src={data.image} alt="testimonials" />
                                                            <div className="detail">
                                                                <h4>{data.name}</h4>
                                                                <span>{data.title}</span>
                                                            </div>
                                                        </div>
                                                        <div className="inner-contact">
                                                            <p>&quot;Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto
                                                                at sint eligendi possimus perspiciatis asperiores reiciendis hic
                                                                amet alias aut quaerat maiores blanditiis.&quot;</p>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                </Slider>
                            </Fade>
                        </div>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Testimonials
