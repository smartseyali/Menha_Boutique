import Link from 'next/link'
import React from 'react'
import { Col, Row } from 'react-bootstrap'

const Breadcrumb = ({ title }: any) => {
    return (
        <section className="section-breadcrumb margin-b-50">
            <div className="container">
                <Row>
                    <div className="col-12">
                        <Row className="bb-breadcrumb-inner">
                            <Col md={6} sm={12}>
                                <h2 className="bb-breadcrumb-title">{title}</h2>
                            </Col>
                            <Col md={6} sm={12}>
                                <ul className="bb-breadcrumb-list">
                                    <li className="bb-breadcrumb-item"><Link href="/">Home</Link></li>
                                    <li><i className="ri-arrow-right-double-fill"></i></li>
                                    <li className="bb-breadcrumb-item active">{title}</li>
                                </ul>
                            </Col>
                        </Row>
                    </div>
                </Row>
            </div>
        </section>
    )
}

export default Breadcrumb
