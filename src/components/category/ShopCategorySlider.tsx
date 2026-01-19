"use client"
import React, { useEffect } from 'react'
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import { Fade } from 'react-awesome-reveal';
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Row } from 'react-bootstrap';
import Link from 'next/link';
import AOS from "aos";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import { useDispatch } from 'react-redux';
import { setSelectedCategory, setSearchTerm } from '@/store/reducer/filterReducer';

const ShopCategorySlider = ({
  onSuccess = () => { },
  onError = () => { },
  }) => {
  
  const dispatch = useDispatch();
  const { data, error } = useSWR("/api/category-slider", fetcher, { onSuccess, onError });
  const settings = {
    modules:[Autoplay],
    spaceBetween: 24,
    loop: true,
    autoplay: {delay: 3000, disableOnInteraction: false},
    speed: 500,
    breakpoints: {
      0: { slidesPerView: 1 },
      421: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      992: { slidesPerView: 4 },
      1200: { slidesPerView: 5 },
      1400: { slidesPerView: 6 },
    },
  };
  useEffect(() => {
    AOS.init();
  }, []);

  if (error) return <div>Failed to load products</div>;
  if (!data) return <div></div>

  const handleCategoryClick = (categoryName: string) => {
    dispatch(setSelectedCategory([categoryName]));
    dispatch(setSearchTerm(""));
  };

  return (
    <section className="section-category padding-t-50 mb-24">
      <div className="container">
        <Row>
          <div className="col-12">
            <Swiper {...settings} className="bb-category-6-colum">
              {data && data.length > 0 ? data.map((each: any, index: number) => (
                  <SwiperSlide key={index}>
                    <div key={index} className={`bb-category-box category-items-${each.num}`} data-aos="flip-left" data-aos-duration="1000" data-aos-delay="500">
                      <div className="category-image">
                        <img src={each.image} alt="category" />
                      </div>
                      <div className="category-sub-contact">
                        <h5>
                          <Link 
                            href="/shop-full-width-col-4" 
                            onClick={() => handleCategoryClick(each.name)}
                          >
                            {each.name}
                          </Link>
                        </h5>
                        <p>{each.item} items</p>
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

export default ShopCategorySlider;
