"use client"
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from './slider/Slider'
import DealEndSlider from '../dealend-slider/DealEndSlider'
import { Row } from 'react-bootstrap'

const OfferDealSlider = () => {
    return (
        <section className="section-deal padding-tb-50">
            <div className="container">
                <Row>
                    <div className="col-12">
                        <Fade triggerOnce direction='up' duration={1000} delay={200} >
                            <div className="section-title bb-deal">
                                <div className="section-detail">
                                    <h2 className="bb-title">Black Friday Deals <span>50% Off</span></h2>
                                    <p>{"Don't wait. The time will never be just right."}</p>
                                </div>
                                <DealEndSlider />
                            </div>
                        </Fade>
                    </div>
                    <Slider />
                </Row>
            </div>
        </section>
    )
}

export default OfferDealSlider
