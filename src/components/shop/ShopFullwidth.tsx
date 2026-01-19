"use client"
import React from 'react'
import ShopFullwidthProducts from './shop-product-section/ShopFullwidthProducts'
import { Col, Row } from 'react-bootstrap'

const ShopFullwidth = ({
    col,
    colfive,
    width,
    itemsPerPage,
    lg,
    ...props
}: any) => {
    return (
        <section className="section-shop padding-b-50">
            <div className="container">
                <Row>
                    <Col sm={12}>
                        <ShopFullwidthProducts lg={lg} width={width} colfive={colfive} col={col} itemsPerPage={itemsPerPage} filterType={props.filterType} />
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default ShopFullwidth
