"use client"
import Paginantion from '@/components/paginantion/Paginantion';
import Link from 'next/link';
import React from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Row } from 'react-bootstrap';

const BlogCard = ({
    col,
    categoryData,
    handlePageChange,
    currentPage,
    itemsPerPage
}: any) => {
    return (
        <Row className="mb-minus-24">
            {categoryData?.data.map((data: any, index: number) => (
                <Col sm={12} md={6} lg={col} key={index} className={`mb-24`}>
                    <Fade triggerOnce direction='up' duration={1000} delay={200}>
                        <div className="bb-blog-card">
                            <div className="blog-image">
                                <img src={data.image} alt="blog-1" />
                            </div>
                            <div className="blog-contact">
                                <h5><a onClick={(e) => e.preventDefault()} href="#">{data.title}</a></h5>
                                <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dicta ab illum maiores
                                    error neque amet rem quod consequuntur? Iste, rerum.</p>
                                <div className="blog-btn">
                                    <Link href="/blog-detail-left-sidebar" className="bb-btn-2">Read More</Link>
                                </div>
                            </div>
                        </div>
                    </Fade>
                </Col>
            ))}
            <Col sm={12}>
                {!categoryData?.data.length ? (<div style={{ textAlign: "center" }}>Blog Details is not found.</div>) : (
                    <div className="bb-pro-pagination">
                        <p>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, categoryData?.totalItems)} of {categoryData?.totalItems} item(s)</p>
                        <Paginantion currentPage={currentPage} totalPages={categoryData?.totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </Col>
        </Row>
    )
}

export default BlogCard
