import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import ScrollButton from '../loader/ScrollButton'
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import { setSelectedCategory } from '@/store/reducer/filterReducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { Col, Row } from 'react-bootstrap';
import { slice } from "lodash";
import { motion } from "framer-motion";
import Link from 'next/link';

const Footer = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
}) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const [dropdownState, setDropdownState] = useState<string | null>(null);
    const { selectedCategory } = useSelector((state: RootState) => state.filter)
    const { data, error } = useSWR("/api/category", fetcher, { onSuccess, onError });

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>;

    const getData = () => {
        if (hasPaginate) return data.data;
        else return data.length > 6 ? slice(data, 0, 6) : data;
    };

    const categories = getData();
    const handleCategoryChange = (category: any) => {
        const updatedCategory = selectedCategory.includes(category)
            ? selectedCategory.filter((cat) => cat !== category)
            : [...selectedCategory, category];
        dispatch(setSelectedCategory(updatedCategory));
        router.push("/shop-full-width-col-4");
    };

    const toggleDropdown = (dropdown: string) => {
        setDropdownState((current) => (current === dropdown ? null : dropdown));
    };
    return (
        <>
            <ScrollButton />
            <footer className="bb-footer margin-t-50">
                
                <div className="footer-container">
                    <div className="footer-top padding-tb-50">
                        <div className="container">
                            <Row className="m-minus-991">
                                <Col lg={3} className="bb-footer-cat col-12">
                                    <div className="bb-footer-widget bb-footer-company">
                                        <img src="/assets/img/logo/logo.gif" className="bb-footer-logo" alt="footer logo" />
                                        <img src="/assets/img/logo/logo.gif" className="bb-footer-dark-logo" alt="footer logo" />
                                        <p className="bb-footer-detail">Pattikadai, a brand of Thandatti Foods, is an online home for pure, healthy, preservative-free country foods inspired by Grandma Eshwari&apos;s traditional cooking. It is our family&apos;s love, tradition, and trust packed for yours.</p>
                                        {/* <div className="bb-app-store">
                                            <a onClick={(e) => e.preventDefault()} href="#" className="app-img">
                                                <img src="/assets/img/app/android.png" className="adroid" alt="apple" />
                                            </a>
                                            <a onClick={(e) => e.preventDefault()} href="#" className="app-img">
                                                <img src="/assets/img/app/apple.png" className="apple" alt="apple" />
                                            </a>
                                        </div> */}
                                    </div>
                                </Col>
                                <Col lg={2} className="bb-footer-info col-12">
                                    <div className="bb-footer-widget">
                                        <h4 onClick={() => toggleDropdown("category")} className="bb-footer-heading">Category<div className='bb-heading-res'><i className='ri-arrow-down-s-line'></i></div></h4>
                                        <motion.div 
                                            className={`bb-footer-links bb-footer-dropdown`}
                                            initial={{ height: 0, opacity: 0, translateY: -20 }}
                                            animate={{
                                            height: dropdownState === "category" ? "auto" : 0,
                                            opacity: dropdownState === "category" ? 1 : 0,
                                            translateY: dropdownState === "category" ? 0 : -20,
                                            }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            style={{
                                            overflow: "hidden",
                                            display: "block",
                                            paddingBottom:
                                                dropdownState === "category" ? "20px" : "0px",
                                            }}
                                        >
                                            <ul className="align-items-center">
                                                {categories?.map((data: any, index: any) => (
                                                    <li key={index} className="bb-footer-link">
                                                        <a onClick={() => handleCategoryChange(data.category)}>{data.category}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    </div>
                                </Col>
                                <Col lg={2} className="bb-footer-account col-12">
                                    <div className="bb-footer-widget">
                                        <h4 onClick={() => toggleDropdown("company")} className="bb-footer-heading">Company<div className='bb-heading-res'><i className='ri-arrow-down-s-line'></i></div></h4>
                                        <motion.div
                                            className={`bb-footer-links bb-footer-dropdown`}
                                            initial={{ height: 0, opacity: 0, translateY: -20 }}
                                            animate={{
                                            height: dropdownState === "company" ? "auto" : 0,
                                            opacity: dropdownState === "company" ? 1 : 0,
                                            translateY: dropdownState === "company" ? 0 : -20,
                                            }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            style={{
                                            overflow: "hidden",
                                            display: "block",
                                            paddingBottom:
                                                dropdownState === "company" ? "20px" : "0px",
                                            }}
                                        >
                                            <ul className="align-items-center">
                                                <li className="bb-footer-link">
                                                    <Link href="/about-us">About us</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/faq">Faq</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/terms">Terms & conditions</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/privacy-policy">Privacy Policy</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/contact-us">Contact us</Link>
                                                </li>
                                            </ul>
                                        </motion.div>
                                    </div>
                                </Col>
                                {/* <Col lg={2} className="bb-footer-service col-12">
                                    <div className="bb-footer-widget">
                                        <h4 onClick={() => toggleDropdown("account")} className="bb-footer-heading">Account<div className='bb-heading-res'><i className='ri-arrow-down-s-line'></i></div></h4>
                                        <motion.div
                                            className={`bb-footer-links bb-footer-dropdown`}
                                            initial={{ height: 0, opacity: 0, translateY: -20 }}
                                            animate={{
                                            height: dropdownState === "account" ? "auto" : 0,
                                            opacity: dropdownState === "account" ? 1 : 0,
                                            translateY: dropdownState === "account" ? 0 : -20,
                                            }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            style={{
                                            overflow: "hidden",
                                            display: "block",
                                            paddingBottom:
                                                dropdownState === "account" ? "20px" : "0px",
                                            }}
                                        >
                                            <ul className="align-items-center">
                                                <li className="bb-footer-link">
                                                    <Link href="/login">Sign In</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/cart">View Cart</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/faq">Return Policy</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/shop-full-width-col-4">Become a Vendor</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/product-left-sidebar">Affiliate Program</Link>
                                                </li>
                                                <li className="bb-footer-link">
                                                    <Link href="/checkout">Payments</Link>
                                                </li>
                                            </ul>
                                        </motion.div>
                                    </div>
                                </Col> */}
                                <Col lg={3} className="bb-footer-cont-social col-12">
                                    <div className="bb-footer-contact">
                                        <div className="bb-footer-widget">
                                            <h4 onClick={() => toggleDropdown("contact")} className="bb-footer-heading">Contact<div className='bb-heading-res'><i className='ri-arrow-down-s-line'></i></div></h4>
                                            <motion.div 
                                                className={`bb-footer-links bb-footer-dropdown`}
                                                initial={{ height: 0, opacity: 0, translateY: -20 }}
                                                animate={{
                                                    height: dropdownState === "contact" ? "auto" : 0,
                                                    opacity: dropdownState === "contact" ? 1 : 0,
                                                    translateY: dropdownState === "contact" ? 0 : -20,
                                                }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                style={{
                                                    overflow: "hidden",
                                                    display: "block",
                                                    paddingBottom:
                                                    dropdownState === "contact" ? "20px" : "0px",
                                                }}
                                            >
                                                <ul className="align-items-center">
                                                    <li className="bb-footer-link bb-foo-location">
                                                        <span className="mt-15px">
                                                            <i className="ri-map-pin-line"></i>
                                                        </span>
                                                        <p>No.206, V.G.V Garden, Kangeyam Road, Rakkiyapalayam, Tiruppur, Tiruppur, Tamil Nadu, 641606</p>
                                                    </li>
                                                    <li className="bb-footer-link bb-foo-call">
                                                        <span>
                                                            <i className="ri-whatsapp-line"></i>
                                                        </span>
                                                        <Link href="tel:+919150444595">+91 9150444595</Link>
                                                    </li>
                                                    <li className="bb-footer-link bb-foo-mail">
                                                        <span>
                                                            <i className="ri-mail-line"></i>
                                                        </span>
                                                        <Link href="mailto:pattikadaiofficial@gmail.com">pattikadaiofficial@gmail.com</Link>
                                                    </li>
                                                </ul>
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div className="bb-footer-social">
                                        <div className="bb-footer-widget">
                                            <div className="bb-footer-links bb-footer-dropdown">
                                                <ul className="align-items-center">
                                                    <li className="bb-footer-link">
                                                        <a href="https://www.facebook.com/share/19riyqAvB9/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><i className="ri-facebook-fill"></i></a>
                                                    </li>
                                                    <li className="bb-footer-link">
                                                        <a href="https://youtube.com/@countryfoodcooking2613?si=mj0BeUdac_IQElB3" target="_blank" rel="noopener noreferrer"><i className="ri-youtube-fill"></i></a>
                                                    </li>
                                                    <li className="bb-footer-link">
                                                        <a href="https://www.instagram.com/countryfoodcooking?igsh=bDNod2JyM2x6OTk1" target="_blank" rel="noopener noreferrer"><i className="ri-instagram-line"></i></a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <div className="container">
                            <Row>
                                <div className="bb-bottom-info">
                                    <div className="footer-copy">
                                        <div className="footer-bottom-copy ">
                                            <div className="bb-copy">Copyright © <span id="copyright_year">{new Date().getFullYear()} </span>
                                                <Link className="site-name" href="/">Thandatti Foods</Link>. All rights reserved.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="footer-bottom-right">
                                        <div className="footer-bottom-payment d-flex justify-content-center">
                                            <div className="payment-link">
                                                <img src="/assets/img/payment/payment.png" alt="payment" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Row>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer
