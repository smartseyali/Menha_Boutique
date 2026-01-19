import React from 'react'
import Categories from './blog-category/Categories'
import { Fade } from 'react-awesome-reveal'
import Link from 'next/link'

const Articles = ({
    selectedCategory,
}: any) => {
    return (
        <>
            <div className="bb-blog-sidebar">
                <Fade triggerOnce direction='up' duration={1000} delay={200}>
                    <div className="blog-inner-contact">
                        <div className="blog-sidebar-title">
                            <h4>Recent Articles</h4>
                        </div>
                        <div className="blog-sidebar-card">
                            <div className="inner-image">
                                <img src="/assets/img/blog/7.jpg" alt="blog" />
                            </div>
                            <div className="blog-sidebar-contact">
                                <span>Marketing</span>
                                <h4><Link href="/blog-detail-left-sidebar">Marketing Guide: 5 Steps to Success.</Link></h4>
                                <p>February 10, 2025</p>
                            </div>
                        </div>
                        <div className="blog-sidebar-card">
                            <div className="inner-image">
                                <img src="/assets/img/blog/8.jpg" alt="blog" />
                            </div>
                            <div className="blog-sidebar-contact">
                                <span>Business</span>
                                <h4><Link href="/blog-detail-left-sidebar">Business ideas to grow your business.</Link></h4>
                                <p>Jan 1, 2024</p>
                            </div>
                        </div>
                        <div className="blog-sidebar-card">
                            <div className="inner-image">
                                <img src="/assets/img/blog/9.jpg" alt="blog" />
                            </div>
                            <div className="blog-sidebar-contact">
                                <span>Business</span>
                                <h4><Link href="/blog-detail-left-sidebar">Best way to solve business deal issue.</Link></h4>
                                <p>Jun 02, 2024</p>
                            </div>
                        </div>
                        <div className="blog-sidebar-card">
                            <div className="inner-image">
                                <img src="/assets/img/blog/10.jpg" alt="blog" />
                            </div>
                            <div className="blog-sidebar-contact">
                                <span>Customer</span>
                                <h4><Link href="/blog-detail-left-sidebar">31 customer stats know in 2025.</Link></h4>
                                <p>May 20, 2024</p>
                            </div>
                        </div>
                    </div>
                </Fade>
                <Categories selectedCategory={selectedCategory} />
            </div>
        </>
    )
}

export default Articles
