"use client"
import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap';

const Faq = () => {
    const [activeAccordion, setActiveAccordion] = useState(1);

    const handleAccordionToggle = (index: any) => {
        setActiveAccordion(index === activeAccordion ? null : index);
    };

    return (
        <section className="section-faq padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24">
                    <Col sm={12}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="section-title bb-center">
                                <div className="section-detail">
                                    <h2 className="bb-title">frequently asked <span>questions</span></h2>
                                    <p>Customer service management.</p>
                                </div>
                            </div>
                        </Fade>
                    </Col>
                    {/* <Col lg={4} className="mb-24">
                        <Fade className="bb-faq-img" triggerOnce direction='up' duration={1000} delay={200}>
                            <img src="/assets/img/faq/faq.jpg" alt="faq-img" />
                        </Fade>
                    </Col> */}
                    <Col lg={12} className="mb-24">
                        <Fade className="bb-faq-contact" triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="accordion" id="accordionExample">
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(0)} className="accordion-header" id="headingOne">
                                        <button className={`accordion-button ${activeAccordion === 0 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                            Are your products truly organic and homemade?
                                        </button>
                                    </h2>
                                    <div id="collapseOne" className={`accordion-collapse collapse ${activeAccordion === 0 ? "show" : ""}`}
                                        aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            Yes! All our products are crafted using traditional methods passed down from our grandmother. We use only organic, locally sourced ingredients without any artificial preservatives, colors, or flavors to ensure authentic taste and quality.
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(1)} className="accordion-header" id="headingTwo">
                                        <button className={`accordion-button ${activeAccordion === 1 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                            Where do you source your ingredients?
                                        </button>
                                    </h2>
                                    <div id="collapseTwo" className={`accordion-collapse collapse ${activeAccordion === 1 ? "show" : ""}`}
                                        aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            We source our ingredients directly from trusted local farmers who practice sustainable and organic farming. This direct partnership ensures that every ingredient used in our kitchen is fresh, pure, and of the highest quality.
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(2)} className="accordion-header" id="headingThree">
                                        <button className={`accordion-button ${activeAccordion === 2 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseThree" aria-expanded="false"
                                            aria-controls="collapseThree">
                                            How should I store the products?
                                        </button>
                                    </h2>
                                    <div id="collapseThree" className={`accordion-collapse collapse ${activeAccordion === 2 ? "show" : ""}`}
                                        aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            Since our products are free from artificial preservatives, we recommend storing them in a cool, dry place away from direct sunlight. Some specific items, like certain pickles or pastes, may require refrigeration after opening. Please refer to the label on each product for specific storage instructions.
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(3)} className="accordion-header" id="headingFour">
                                        <button className={`accordion-button ${activeAccordion === 3 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseFour" aria-expanded="false"
                                            aria-controls="collapseFour">
                                            Do you ship internationally?
                                        </button>
                                    </h2>
                                    <div id="collapseFour" className={`accordion-collapse collapse ${activeAccordion === 3 ? "show" : ""}`} aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            Currently, we ship across the country to bring our traditional flavors to your doorstep. We are actively working on expanding our shipping capabilities to serve international customers in the near future. Stay tuned for updates!
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(4)} className="accordion-header" id="headingFive">
                                        <button className={`accordion-button ${activeAccordion === 4 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseFive" aria-expanded="false"
                                            aria-controls="collapseFive">
                                            What is your return and refund policy?
                                        </button>
                                    </h2>
                                    <div id="collapseFive" className={`accordion-collapse collapse ${activeAccordion === 4 ? "show" : ""}`} aria-labelledby="headingFive" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            We take great care in packaging our products to ensure they reach you safely. However, if you receive a damaged or incorrect item, please contact our customer support within 24 hours of delivery. We will be happy to arrange a replacement or a refund for you.
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 onClick={() => handleAccordionToggle(5)} className="accordion-header" id="headingSix">
                                        <button className={`accordion-button ${activeAccordion === 5 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                            Are your products suitable for specific diets?
                                        </button>
                                    </h2>
                                    <div id="collapseSix" className={`accordion-collapse collapse ${activeAccordion === 5 ? "show" : ""}`} aria-labelledby="headingSix" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                            Many of our products are naturally vegan and gluten-free, as we use traditional ingredients. We clearly list all ingredients on the product packaging and our website description, allowing you to make informed choices based on your specific dietary needs and preferences.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default Faq
