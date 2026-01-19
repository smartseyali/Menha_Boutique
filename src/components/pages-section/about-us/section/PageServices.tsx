import Services from '@/components/services/Services';
import React from 'react'
import { Fade } from 'react-awesome-reveal';
import { Row } from 'react-bootstrap';

const PageServices = () => {
    return (
        <section className="section-services padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24">
                    <div className="col-12">
                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="section-title bb-center">
                                <div className="section-detail">
                                    <h2 className="bb-title">Our <span>Services</span></h2>
                                    <p>Customer service should not be a department. It should be the entire company.</p>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <Services />
                </Row>
            </div>
        </section>
    )
}

export default PageServices;
