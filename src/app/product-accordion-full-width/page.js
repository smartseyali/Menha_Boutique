"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ProductFullwidthAccordion from '@/components/products-section/ProductFullwidthAccordion'
import RelatedSlider from '@/components/deal-slider/RelatedSlider'
import { Row } from 'react-bootstrap'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Product Page"} />
      <section className="section-product padding-tb-50">
        <div className="container">
          <Row>
            <ProductFullwidthAccordion />
          </Row>
        </div>
      </section>
      <RelatedSlider />
    </>
  )
}

export default page
