"use client"
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from './slider/Slider'
import Timer from '../dealend-slider/Timer'
import { Row } from 'react-bootstrap'

const DealSlider = () => {
    
    // const targetDate = "january 29, 2025 20:00:00 PDT"
    const now = new Date().getTime();
    const targetDate = new Date(now + 26 * 24 * 60 * 60 * 1000).toLocaleString('en-US');

    return (
        <section className="section-deal padding-tb-50">
            <div className="container">
                <Row>
                    <div className='col-12'>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} >
                            <div className="section-title bb-deal">
                                <div className="section-detail">
                                    <h2 className="bb-title">Day of the <span>deal</span></h2>
                                    <p>{"Don't wait. The time will never be just right."}</p>
                                </div>
                                <Timer targetDate={targetDate} />
                            </div>
                        </Fade>
                    </div>
                    <Slider />
                </Row>
            </div>
        </section>
    )
}

export default DealSlider
