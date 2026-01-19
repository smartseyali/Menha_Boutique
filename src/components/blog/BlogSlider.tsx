"use client"
import React, { useEffect } from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Fade } from 'react-awesome-reveal';
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Row } from 'react-bootstrap';
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import Link from 'next/link';
import AOS from "aos";

const BlogSlider = ({
  onSuccess = () => { },
  hasPaginate = false,
  onError = () => { },
}) => {
  const { data, error } = useSWR("/api/blog-slider", fetcher, { onSuccess, onError });

  const settings = {
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 24,
    loop: true,
    navigation: false,
    pagination: false,
    autoplay: false,
    speed: 500,
    breakpoints: {
      0: { slidesPerView: 1 },
      421: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1200: { slidesPerView: 4 },
    },
  };
  useEffect(() => {
    AOS.init();
  }, []);

  if (error) return <div>Failed to load products</div>;

  const getData = () => {
    if (hasPaginate) return data.data;
    else return data;
  };

  return (
    <section className="section-blog padding-b-50 padding-t-100">
      <div className="container">
        <Row>
          <div className='col-12'>
            <Swiper {...settings} className="blog-2-slider owl-carousel">
              {getData()?.map((data: any, index: any) => (
                <SwiperSlide className='owl-item' key={index}>                  
                  <div className="blog-2-card" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                    <div className="blog-img">
                      <img src={data.image} alt="blog-7" />
                    </div>
                    <div className="blog-contact">
                      <span>{data.date} - {data.name}</span>
                      <h4><Link href="/blog-detail-left-sidebar">{data.title}</Link>
                      </h4>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Row>
      </div>
    </section>
  )
}

export default BlogSlider;

