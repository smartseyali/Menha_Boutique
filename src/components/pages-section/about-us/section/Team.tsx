import React from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Row } from 'react-bootstrap';
import useSWR from 'swr';
import fetcher from '@/components/fetcher/Fetcher';

const Team = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}) => {
    const { data, error } = useSWR("/api/team", fetcher, { onSuccess, onError });

    const settings = {
        dots: false,
        infinite: true,
        nav: true,
        autoplay: true,
        arrows: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1440,
                settings: {
                    slidesToShow: 4,

                },
            },
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 4,
                },
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 420,
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
        <section className="section-team padding-tb-50">
            <div className="container">
                <Row>
                    <div className='col-12'>
                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="section-title bb-center">
                                <div className="section-detail">
                                    <h2 className="bb-title">Our <span>Team</span></h2>
                                    <p>Meet out expert team members.</p>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className='col-12'>
                        <Slider  {...settings} className="bb-team owl-carousel">
                            {getData().map((data: any, index: any) => (
                                <Fade key={index} triggerOnce direction='up' duration={1000} delay={data.num} >
                                    <div className="bb-team-box margin-none">
                                        <div className="bb-team-img">
                                            <div className="bb-team-socials">
                                                <div className="inner-shape"></div>
                                                <ul>
                                                    <li className="bb-social-link">
                                                        <a onClick={(e) => e.preventDefault()} href="#"><i className="ri-facebook-fill"></i></a>
                                                    </li>
                                                    <li className="bb-social-link">
                                                        <a onClick={(e) => e.preventDefault()} href="#"><i className="ri-twitter-x-fill"></i></a>
                                                    </li>
                                                    <li className="bb-social-link">
                                                        <a onClick={(e) => e.preventDefault()} href="#"><i className="ri-linkedin-fill"></i></a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <img src={data.image} alt="team-1" />
                                        </div>
                                        <div className="bb-team-contact">
                                            <h5>{data.name}</h5>
                                            <p>{data.position}</p>
                                        </div>
                                    </div>
                                </Fade>
                            ))}
                        </Slider>
                    </div>
                </Row>
            </div>
        </section>
    )
}

export default Team
