"use client"
import React, { useEffect } from 'react'
// import { Fade } from 'react-awesome-reveal'
// import Slider from "react-slick"
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import AOS from "aos";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const ExploreCategory = ({
  onSuccess = () => { },
  onError = () => { },
}) => {
  const { data, error } = useSWR("/api/category-slider", fetcher, { onSuccess, onError });
  const settings = {
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 3000, disableOnInteraction: false
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      421: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
    modules: [Autoplay]
  };
  useEffect(() => {
    AOS.init();
  }, []);

  if (error) {
    console.error("Error loading categories:", error);
    // Return empty section to maintain layout
    return <div></div>;
  }
  if (!data) return <div></div>
  
  // Ensure data is an array
  const categories = Array.isArray(data) ? data : [];

  return (
    <>
      <section className="section-category padding-tb-50">
        <div className="container">
          <Row className="mb-minus-24">
            <Col lg={5} className="col-12 mb-24">
              <div className="bb-category-img">
                <img src="/assets/img/category/category.jpg" alt="category" />
                {/* <div className="bb-offers">
                  <span>50% Off</span>
                </div> */}
              </div>
            </Col>
            <Col lg={7} className="col-12 mb-24">
              <div className="bb-category-contact">
                <div className="category-title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
                  <h2>Explore Categories</h2>
                </div>
                <Swiper {...settings} className="bb-category-block owl-carousel">
                  {categories && categories.length > 0 ? categories.map((data: any, index: any) => (
                    <SwiperSlide key={index}>
                      <div className={`bb-category-box category-items-${data.num || index + 1}`} data-aos="flip-left" data-aos-duration="1000" data-aos-delay="200">
                        <div className="category-image">
                          <img src={data.image} alt="category" />
                        </div>
                        <div className="category-sub-contact">
                          <h5><Link href="/shop-full-width-col-4">{data.name}</Link></h5>
                          <p>{data.item || 0} items</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  )): <></>}
                </Swiper>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  )
}

export default ExploreCategory
