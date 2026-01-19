"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Products from '@/components/products-section/Products'
import RelatedSlider from '@/components/deal-slider/RelatedSlider'
import { Row } from 'react-bootstrap'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Product Page"} />
      <section className="section-product padding-tb-50">
        <div className="container">
          <Row className="row mb-minus-24">
            <Products />
          </Row>
        </div>
      </section>
      <RelatedSlider />
    </>
  )
}

export default page
