import React from 'react';
import { Fade } from 'react-awesome-reveal';
import { Col, Row } from 'react-bootstrap';

const PrivacyPolicy = () => {
    return (
        <>
            <section className="section-privacy padding-tb-50">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center" >
                                <div className="section-detail">
                                    <h2 className="bb-title">Privacy <span>Policy</span></h2>
                                    <p className="lead text-muted">Your privacy is important to us. Please read our privacy policy carefully.</p>
                                </div>
                            </Fade>
                        </div>
                        <div className="desc">
                            <Row className="row mb-minus-24 justify-content-center">
                                <Col lg={10} className="mb-24">
                                    <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                        <div className="terms-detail p-4 shadow-sm bg-white rounded">
                                            {/* Privacy Policy Section */}
                                            <div className="block mb-5">
                                                <p className="text-justify" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                                                    This Privacy Policy describes how <strong>Pattikadai, a brand of Thandatti Foods</strong> (referred to as &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and discloses your personal information when you visit, make a purchase from, or interact with our website, <a href="https://pattikadai.com/" className="text-primary">https://pattikadai.com/</a> (the &quot;Site&quot;).
                                                </p>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>1. Information We Collect</h3>
                                                <p className="mb-3">We collect personal information about you from various sources. The categories of information we collect include:</p>
                                                
                                                <div className="ms-3 mb-4">
                                                    <h4 className="mt-3 mb-2" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>A. Information You Provide Directly</h4>
                                                    <p>When you place an order, create an account, subscribe to our newsletter, or contact us, you voluntarily give us the following personal information:</p>
                                                    <ul className="list-disc ps-4 mt-2">
                                                        <li className="mb-2"><strong>Contact Information:</strong> Name, shipping address, billing address, email address, and phone number.</li>
                                                        <li className="mb-2"><strong>Account Information:</strong> Username and password (stored securely and encrypted).</li>
                                                        <li className="mb-2"><strong>Payment Information:</strong> Payment method details (credit card number, expiration date, etc.). <em>Note: This information is typically processed directly by a third-party payment processor (like Shopify Payments, PayPal, Stripe) and is usually not stored on our servers.</em></li>
                                                        <li className="mb-2"><strong>Dietary/Preference Information (Optional):</strong> If you provide it, information regarding allergies, dietary restrictions, or food preferences relevant to the products you purchase.</li>
                                                    </ul>
                                                </div>

                                                <div className="ms-3">
                                                    <h4 className="mt-3 mb-2" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>B. Information Collected Automatically</h4>
                                                    <p>When you access the Site, we automatically collect certain information about your device and interaction with the Site:</p>
                                                    <ul className="list-disc ps-4 mt-2">
                                                        <li className="mb-2"><strong>Device Information:</strong> IP address, web browser type, time zone, and some cookies installed on your device.</li>
                                                        <li className="mb-2"><strong>Usage Data:</strong> Details about how you browse the Site, including the web pages or products you view, what websites or search terms referred you to the Site, and the time spent on those pages.
                                                            <ul className="list-disc ps-4 mt-2 text-muted">
                                                                <li>This data is collected using technologies like cookies, log files, web beacons, tags, and pixels.</li>
                                                            </ul>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>2. How We Use Your Personal Information</h3>
                                                <p className="mb-3">We use the information we collect for the following key purposes:</p>
                                                <ul className="list-disc ps-4 mt-2">
                                                    <li className="mb-2"><strong>Fulfilling Orders and Services:</strong> To process your payment, ship your food products, provide invoices and order confirmations, and manage returns and exchanges.</li>
                                                    <li className="mb-2"><strong>Account Management:</strong> To create, maintain, and manage your user account on our platform.</li>
                                                    <li className="mb-2"><strong>Communication:</strong> To communicate with you about your order status, respond to customer service inquiries, and send administrative messages.</li>
                                                    <li className="mb-2"><strong>Marketing and Advertising:</strong> To send you promotional emails, newsletters, or targeted advertisements that we believe may be of interest to you (based on your prior purchases and browsing activity), consistent with your preferences.</li>
                                                    <li className="mb-2"><strong>Improvement of Services:</strong> To analyze website usage, measure the effectiveness of our campaigns, and improve our website functionality and product offerings.</li>
                                                </ul>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>3. Sharing Your Personal Information</h3>
                                                <p className="mb-3">We share your Personal Information with third parties to help us provide our services and fulfill our contracts with you.</p>
                                                <ul className="list-disc ps-4 mt-2">
                                                    <li className="mb-3"><strong>Service Providers:</strong> We share necessary information with third parties who perform services on our behalf, such as:
                                                        <ul className="list-disc ps-4 mt-2">
                                                            <li className="mb-1">Shipping and Logistics Companies: To deliver your order.</li>
                                                            <li className="mb-1">Payment Processors: To securely process your payment details.</li>
                                                            <li className="mb-1">Analytics Providers: Google Analytics to understand how our customers use the Site.</li>
                                                        </ul>
                                                    </li>
                                                    <li className="mb-2"><strong>Legal Compliance:</strong> We may share your information to comply with applicable laws and regulations, to respond to a subpoena, search warrant, or other lawful request for information we receive, or to otherwise protect our rights.</li>
                                                    <li className="mb-2"><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your personal information may be transferred as part of the transaction.</li>
                                                </ul>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>4. Your Rights</h3>
                                                <ul className="list-disc ps-4 mt-2">
                                                    <li className="mb-2"><strong>Right to Access:</strong> The right to request copies of the personal data we hold about you.</li>
                                                    <li className="mb-2"><strong>Right to Rectification:</strong> The right to request that we correct any information you believe is inaccurate.</li>
                                                    <li className="mb-2"><strong>Right to Erasure (&apos;Right to be Forgotten&apos;):</strong> The right to request that we erase your personal data, under certain conditions.</li>
                                                    <li className="mb-2"><strong>Right to Opt-Out of Marketing:</strong> You can always unsubscribe from our marketing emails by clicking the &quot;unsubscribe&quot; link at the bottom of any email.</li>
                                                </ul>
                                                <p className="mt-2 text-muted fst-italic">If you wish to exercise any of these rights, please contact us using the details below.</p>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>5. Data Security and Retention</h3>
                                                <ul className="list-disc ps-4 mt-2">
                                                    <li className="mb-2">We use reasonable technical and organizational measures to protect your Personal Information. However, no electronic transmission or storage is 100% secure.</li>
                                                    <li className="mb-2">We will retain your Personal Information only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.</li>
                                                </ul>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>6. Changes to This Policy</h3>
                                                <p>We may update this Privacy Policy from time to time to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.</p>
                                            </div>

                                            <div className="block mb-5">
                                                <h3 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2c3e50' }}>7. Contact Us</h3>
                                                <div className="bg-light p-4 rounded border">
                                                    <p className="mb-0">For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us:</p>
                                                    <p className="mt-3 mb-1"><strong>Email:</strong> <a href="mailto:pattikadaiofficial@gmail.com" className="text-secondary">pattikadaiofficial@gmail.com</a></p>
                                                    <p className="mb-0"><strong>WhatsApp:</strong> <a href="https://wa.me/919150444595" className="text-secondary">+91 9150444595</a></p>
                                                </div>
                                            </div>
                                            
                                            <hr className="my-5" style={{ opacity: 0.1 }}/>

                                            {/* Refund & Return Policy Section */}
                                            <div className="section-title bb-center mb-5">
                                                <h3 className="bb-title" style={{ fontSize: '2rem' }}>Refund & <span>Return Policy</span></h3>
                                            </div>
                                            
                                            <div className="block mb-5">
                                                <div className="p-4 rounded border" style={{ backgroundColor: '#fff5f5', borderColor: '#ffebeb' }}>
                                                    <ol className="list-decimal ps-4 mt-2">
                                                        <li className="mb-3">No returns, No refunds will be provided once the product is delivered due to the nature of items we sell.</li>
                                                        <li className="mb-3">In case of valid damage claims, must be reported within <strong>24 Hours</strong> of product delivery for replacement. At our discretion, we may offer a replacement only, and the new item will be delivered within 4–5 working days. No exchange will be accepted.</li>
                                                        <li className="mb-3">If any refund is approved under any circumstances the amount will be credited back to your original payment method within 5 - 10 working days.</li>
                                                    </ol>
                                                </div>
                                            </div>

                                            <hr className="my-5" style={{ opacity: 0.1 }}/>

                                            {/* Shipping Policy Section */}
                                            <div className="section-title bb-center mb-5">
                                                <h3 className="bb-title" style={{ fontSize: '2rem' }}>Shipping <span>Policy</span></h3>
                                            </div>

                                            <div className="block">
                                                <div className="p-4 rounded border bg-light">
                                                    <ol className="list-decimal ps-4 mt-2">
                                                        <li className="mb-3">The product will be delivered within <strong>6 working days</strong> to your registered address from the date of order.</li>
                                                        <li className="mb-3">All India shipping Available.</li>
                                                    </ol>
                                                </div>
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


export default PrivacyPolicy;
