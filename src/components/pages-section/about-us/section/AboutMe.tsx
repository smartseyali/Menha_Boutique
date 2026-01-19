import React from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap'

const AboutMe = () => {
    return (
        <>
            <section className="section-about padding-tb-50">
                <div className="container">
                    <Row className="mb-minus-24">
                        {/* <Col lg={6} className="mb-24 col-12">
                            <div className="bb-about-img">
                                <img src="/assets/img/about/one.png" alt="about-one" />
                            </div>
                        </Col> */}
                        <Col lg={12} className="mb-24 col-12">
                            <div className="bb-about-contact">
                                <Fade triggerOnce direction='up' duration={1000} delay={200} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                                    <div className="section-title">
                                        <div className="section-detail">
                                            <h2 className="bb-title">About the <span>Pattikadai</span></h2>
                                        </div>
                                    </div>
                                </Fade>
                                <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                    <div className="about-inner-contact">
                                        <h4>Authentic Tradition, Crafted by Grandma&apos;s Hands.</h4>
                                        <p>What started as simple cooking videos by Grandma Eshwari well known as Country food-cooking Patti soon became a sensation, with millions admiring her humility, smile, and soulful recipes. Today, with her grandson, she continues this legacy through Patti Kadai—a brand of Thandatti Foods—an online home for pure, healthy, preservative-free country foods inspired by her traditional cooking.</p>
                                        <p>Every product we offer holds a piece of her journey—from the aroma of her kitchen to the values she lives by. Patti Kadai is our tribute to her love, her passion, and her belief that good food heals. We bring you flavours that feel like family, comfort that reminds you of home, the warmth and love of a grandmother and purity that stays true to our roots.</p>
                                        <p>Pattikadai, a brand of Thandatti Foods, is not just a business; it is our family&apos;s love, tradition, and trust packed for yours.</p>
                                    </div>
                                </Fade>
                                {/* <Fade triggerOnce direction='up' duration={1000} delay={600} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
                                    <Row className="bb-vendor-rows row mb-minus-24">
                                        <Col sm={4} className="mb-24">
                                            <div className="bb-vendor-box">
                                                <div className="bb-count">
                                                    <h5 className="counter">200 +</h5>
                                                </div>
                                                <div className="inner-text">
                                                    <p>vendors</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col sm={4} className="mb-24">
                                            <div className="bb-vendor-box">
                                                <div className="bb-count">
                                                    <h5 className="counter">654k +</h5>
                                                </div>
                                                <div className="inner-text">
                                                    <p>Sales</p>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col sm={4} className="mb-24">
                                            <div className="bb-vendor-box">
                                                <div className="bb-count">
                                                    <h5 className="counter">587k +</h5>
                                                </div>
                                                <div className="inner-text">
                                                    <p>Customers</p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Fade> */}
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default AboutMe
