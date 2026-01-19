"use client"
import React from 'react'
import ProductsDetails from './Products-Detail/ProductsDetails'
import ProductsAccordionTabs from './Products-Tabs/ProductsAccordionTabs'
import { Col } from 'react-bootstrap'

const ProductFullwidthAccordion = () => {
    return (
        <Col sm={12}>
            <ProductsDetails />
            <ProductsAccordionTabs />
        </Col>
    )
}

export default ProductFullwidthAccordion
