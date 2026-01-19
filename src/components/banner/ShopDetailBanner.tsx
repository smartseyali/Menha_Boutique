import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap'

const ShopDetailBanner = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const options = [{ name: "Chocolates" }, { name: "Vegetables" }, { name: "Fruits" }, { name: "Bakery" }, { name: "Snakes" }, { name: "Spices" }, { name: "Cookies" }]

    const handleActiveTab = (index: any) => {
        setActiveIndex(index)
    }
    return (
        <section className="section-bnr-details padding-t-50 mb-24">
            <div className="container">
                <Fade triggerOnce direction='up' duration={1000} delay={200} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                    <div className="bnr-details-bg mb-24">
                        <Row>
                            <Col lg={6} sm={12}>
                                <div className="bb-bnr-details mb-24">
                                    <div className="bb-image">
                                        <img src="/assets/img/shop-bnr/one.jpg" alt="one" />
                                    </div>
                                    <div className="overlay-bnr"></div>
                                    <div className="inner-contact">
                                        <h4>50%</h4>
                                        <p>Fresh <br></br> Vegetable</p>
                                    </div>
                                </div>
                            </Col>
                            <Col lg={6} sm={12} className="mb-24">
                                <div className="bb-bnr-details">
                                    <div className="bb-image">
                                        <img src="/assets/img/shop-bnr/two.jpg" alt="two" />
                                    </div>
                                    <div className="overlay-bnr"></div>
                                    <div className="inner-contact">
                                        <h4>30%</h4>
                                        <p>Fresh & <br></br> Healthy Fruit</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row >
                            <ul className="bb-shop-tags">
                                {options.map((data, index) => (
                                    <li key={index} onClick={() => handleActiveTab(index)} className={activeIndex === index ? "active-tags" : ""}>
                                        <a>{data.name}</a>
                                    </li>
                                ))}
                            </ul>
                        </Row>
                    </div>
                </Fade>
            </div>
        </section>
    )
}

export default ShopDetailBanner;
