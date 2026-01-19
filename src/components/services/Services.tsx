import React from 'react'
import { Fade } from 'react-awesome-reveal';
import { Col, Row } from 'react-bootstrap';

const Services = () => {
    return (
        <section className="section-services padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24">
                    <Col lg={3} md={6} className="mb-24 col-12">
                        <Fade triggerOnce duration={1000} direction='up' delay={200}>
                            <div className="bb-services-box">
                                <div className="services-img">
                                    <img src="/assets/img/services/1.png" alt="services-1" />
                                </div>
                                {/* <div className="services-contact">
                                    <h4>Free Shipping</h4>
                                    <p>Free shipping on all TN orders</p>
                                </div> */}
                            </div>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </section>
    )
}
export default Services;