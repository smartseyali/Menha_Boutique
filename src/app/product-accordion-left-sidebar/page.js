"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ProductsAccordion from '@/components/products-section/ProductsAccordion'
import RelatedSlider from '@/components/deal-slider/RelatedSlider'
import { Row } from 'react-bootstrap'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Product Page"} />
      <section className="section-product padding-tb-50">
        <div className="container">
          <Row className="mb-minus-24">
            <ProductsAccordion />
          </Row>
        </div>
      </section>
      <RelatedSlider />
    </>
  )
}

export default page
