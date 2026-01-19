"use client"
import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { Row } from 'react-bootstrap'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

const TopVendor = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleProductClick = (index: number) => {
        setSelectedIndex(index);
    };
    return (
        <section className="section-vendors padding-t-50 padding-b-100">
            <div className="container">
                <Tabs
                    selectedIndex={selectedIndex}
                    onSelect={(selectedIndex) => setSelectedIndex(selectedIndex)}>
                    <Row className="mb-minus-24">
                        <div className='col-12'>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center">
                                <div className="section-detail">
                                    <h2 className="bb-title">Top <span>Vendors</span></h2>
                                    <p>Discover Our Trusted Partners: Excllence & Reliability in Every choice</p>
                                </div>
                            </Fade>
                        </div>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="col-lg-5 col-12 mb-24">
                            <div className="bb-vendors-img">
                                <div className="tab-content">
                                    <TabPanel className={`tab-pane fade ${selectedIndex === 0 ? "show active" : ""}`} id="vendors_tab_one">
                                        <a onClick={(e) => e.preventDefault()} href="#" className="bb-vendor-init">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </a>
                                        <img src="/assets/img/vendors/img-1.jpg" alt="vendors-img-1" />
                                        <div className="vendors-local-shape">
                                            <div className="inner-shape"></div>
                                            <img src="/assets/img/vendors/vendor-1.jpg" alt="vendor" />
                                        </div>
                                    </TabPanel>
                                    <TabPanel className={`tab-pane fade ${selectedIndex === 1 ? "show active" : ""}`} id="vendors_tab_two">
                                        <a onClick={(e) => e.preventDefault()} href="#" className="bb-vendor-init">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </a>
                                        <img src="/assets/img/vendors/img-2.jpg" alt="vendors-img-2" />
                                        <div className="vendors-local-shape">
                                            <div className="inner-shape"></div>
                                            <img src="/assets/img/vendors/vendor-2.jpg" alt="vendor" />
                                        </div>
                                    </TabPanel>
                                    <TabPanel className={`tab-pane fade ${selectedIndex === 2 ? "show active" : ""}`} id="vendors_tab_three">
                                        <a onClick={(e) => e.preventDefault()} href="#" className="bb-vendor-init">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </a>
                                        <img src="/assets/img/vendors/img-3.jpg" alt="vendors-img-3" />
                                        <div className="vendors-local-shape">
                                            <div className="inner-shape"></div>
                                            <img src="/assets/img/vendors/vendor-3.jpg" alt="vendor" />
                                        </div>
                                    </TabPanel>
                                    <TabPanel className={`tab-pane fade ${selectedIndex === 3 ? "show active" : ""}`} id="vendors_tab_four">
                                        <a onClick={(e) => e.preventDefault()} href="#" className="bb-vendor-init">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </a>
                                        <img src="/assets/img/vendors/img-4.jpg" alt="vendors-img-4" />
                                        <div className="vendors-local-shape">
                                            <div className="inner-shape"></div>
                                            <img src="/assets/img/vendors/vendor-4.jpg" alt="vendor" />
                                        </div>
                                    </TabPanel>
                                </div>
                            </div>
                        </Fade>
                        <div className="col-lg-7 col-12 mb-24">
                            <TabList className="bb-vendors-tab-nav ">
                                    <Tab style={{ outline: "none" }} className="nav-item" key={"vendors_tab_one"}>
                                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                                            <a className={`nav-link  ${selectedIndex == 0 ? "active" : ""}`} onClick={() => handleProductClick(0)} data-bs-toggle="tab" href="#vendors_tab_one">
                                                <div className="bb-vendors-box">
                                                    <div className="inner-heading">
                                                        <h5>Mira Fashion Pvt. Ltd.</h5>
                                                        <span>Sales - 587</span>
                                                    </div>
                                                    <p>Fruits (5) | Vegetables (30) | Snacks (09) </p>
                                                </div>
                                            </a>
                                        </Fade>
                                    </Tab>
                                    
                                    <Tab style={{ outline: "none" }} className="nav-item" key={"vendors_tab_two"}>
                                        <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                            <a className={`nav-link  ${selectedIndex == 1 ? "active" : ""}`} onClick={() => handleProductClick(1)} data-bs-toggle="tab" href="#vendors_tab_two">
                                                <div className="bb-vendors-box">
                                                    <div className="inner-heading">
                                                        <h5>Eelna Fashion Pvt. Ltd.</h5>
                                                        <span>Sales - 428</span>
                                                    </div>
                                                    <p>Fruits (8) | Vegetables (15) | Snacks (04) </p>
                                                </div>
                                            </a>
                                        </Fade>
                                    </Tab>
                                    
                                    <Tab style={{ outline: "none" }} className="nav-item" key={"vendors_tab_three"}>
                                        <Fade triggerOnce direction='up' duration={1000} delay={600}>
                                            <a className={`nav-link  ${selectedIndex == 2 ? "active" : ""}`} onClick={() => handleProductClick(2)} data-bs-toggle="tab" href="#vendors_tab_three">
                                                <div className="bb-vendors-box">
                                                    <div className="inner-heading">
                                                        <h5>Mario Fashion Pvt. Ltd.</h5>
                                                        <span>Sales - 1024</span>
                                                    </div>
                                                    <p>Fruits (16) | Vegetables (42) | Snacks (18) </p>
                                                </div>
                                            </a>
                                        </Fade>
                                    </Tab>
                                    
                                    <Tab style={{ outline: "none" }} className="nav-item" key={"vendors_tab_four"}>
                                        <Fade triggerOnce direction='up' duration={1000} delay={800}>
                                            <a className={`nav-link  ${selectedIndex == 3 ? "active" : ""}`} onClick={() => handleProductClick(3)} data-bs-toggle="tab" href="#vendors_tab_four">
                                                <div className="bb-vendors-box">
                                                    <div className="inner-heading">
                                                        <h5>Maria Fashion Pvt. Ltd.</h5>
                                                        <span>Sales - 210</span>
                                                    </div>
                                                    <p>Fruits (2) | Vegetables (10) | Snacks (03) </p>
                                                </div>
                                            </a>
                                        </Fade>
                                    </Tab>
                            </TabList>
                        </div>
                    </Row>
                </Tabs>
            </div>
        </section>
    )
}

export default TopVendor
