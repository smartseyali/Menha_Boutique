"use client";
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';
import BlogDetailFullwidth from '@/components/blog-section/BlogDetailFullwidth';
import { Row } from 'react-bootstrap';

const page = () => {
  return (
    <>
      <Breadcrumb title={"Blog"} />
      <section className="section-product padding-tb-50">
        <div className="container">
          <Row>
            <BlogDetailFullwidth />
          </Row>
        </div>
      </section>
    </>
  )
}

export default page
