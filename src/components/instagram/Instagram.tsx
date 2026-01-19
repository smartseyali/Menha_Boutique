"use client"
import React from 'react'
import Slider from "react-slick"
import { Swiper, SwiperSlide } from "swiper/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Fade } from 'react-awesome-reveal';
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import { Row } from 'react-bootstrap';

const Instagram = ({
  onSuccess = () => { },
  hasPaginate = false,
  onError = () => { },
}) => {

  const { data, error } = useSWR("/api/instagram", fetcher, { onSuccess, onError });

  const settings = {
    spaceBetween: 24,
    loop: true,
    speed: 500,
    autoplay: false,
    breakpoints:{
      0: { slidesPerView: 1 },
      321: { slidesPerView: 2 },
      421: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      992: { slidesPerView: 5 },
      1400: { slidesPerView: 6 },
    }
  };

  if (error) return <div>Failed to load products</div>;
  if (!data) return <div></div>

  return (
    <section className="section-instagram padding-tb-50">
      <div className="container">
        <Row>
          <div className="col-12">
            <div className="bb-title">
              <h3>#Insta</h3>
            </div>
            <Swiper {...settings} className="bb-instagram-slider owl-carousel">
              {data && data.length > 0 ? data.map((each: any, index: any) => (
                <SwiperSlide key={index}>
                  <div className="bb-instagram-card">
                    <div className="instagram-img">
                      <a onClick={(e) => e.preventDefault()} href="#">
                        <img src={each.image} alt={`instagram-${index+1}`} />
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              )): <></>}
            </Swiper>
          </div>
        </Row>
      </div>
    </section>
  )
}

export default Instagram
