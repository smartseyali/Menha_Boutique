import React from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap'

const TermsAndConditions = () => {
    return (
        <>
            <section className="section-terms padding-tb-50">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center" >
                                <div className="section-detail">
                                    <h2 className="bb-title">Terms & <span>Conditions</span></h2>
                                    <p>Please read our terms and conditions carefully.</p>
                                </div>
                            </Fade>
                        </div>
                        <div className="desc">
                            <Row className="row mb-minus-24">
                                <Col lg={6} md={12} className="mb-24">
                                    <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                        <div className="terms-detail">
                                            <div className="block">
                                                <h3>1. General Terms</h3>
                                                <p>Welcome to Pattikadai (a brand of Thandatti Foods). By accessing and using this website, you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please do not use our website.</p>
                                            </div>
                                            <div className="block">
                                                <h3>2. Product Authenticity</h3>
                                                <p>Our products are handmade using traditional methods and organic ingredients. As a result, slight variations in color, texture, and taste may occur. These variations are natural and are a testament to the authenticity and lack of artificial preservatives in our products.</p>
                                            </div>
                                            <div className="block">
                                                <h3>3. Pricing & Payments</h3>
                                                <p>All prices listed on our website are current and subject to change without notice. We accept various payment methods, and all transactions are processed securely. We reserve the right to cancel any order if there are issues with payment or stock availability.</p>
                                            </div>
                                            <div className="block">
                                                <h3>4. Shipping Policy</h3>
                                                <p>We strive to deliver your orders within the estimated timeframes. However, delivery times may vary due to external factors. Please ensure that your shipping address is accurate to avoid delays. We are not responsible for packages lost due to incorrect addresses provided by the customer.</p>
                                            </div>
                                        </div>
                                    </Fade>
                                </Col>
                                <Col lg={6} md={12} className="mb-24">
                                    <Fade triggerOnce direction='up' duration={1000} delay={400} >
                                        <div className="terms-detail">
                                            <div className="block">
                                                <h3>5. Returns & Refunds</h3>
                                                <p>Due to the perishable nature of our food products, we generally do not accept returns. However, if you receive a damaged or incorrect item, please contact us within 24 hours of delivery with photographic evidence. We will assess the issue and provide a refund or replacement at our discretion.</p>
                                            </div>
                                            <div className="block">
                                                <h3>6. Dietary Information</h3>
                                                <p>We list all ingredients for our products to help you make informed decisions. However, our products are made in a kitchen that handles nuts, dairy, and other allergens. While we take precautions, we cannot guarantee zero cross-contamination. Customers with severe allergies should exercise caution.</p>
                                            </div>
                                            <div className="block">
                                                <h3>7. User Accounts</h3>
                                                <p>If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                                            </div>
                                            <div className="block">
                                                <h3>8. Privacy Policy</h3>
                                                <p>Your privacy is important to us. We collect and use your personal information in accordance with our Privacy Policy. We do not sell or share your data with third parties for marketing purposes without your consent.</p>
                                            </div>
                                        </div>
                                    </Fade>
                                </Col>
                            </Row>
                        </div>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default TermsAndConditions
