"use client";
import React from "react";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import ProductFullwidth from "@/components/products-section/ProductFullwidth";
import RelatedSlider from "@/components/deal-slider/RelatedSlider";
import { Row } from "react-bootstrap";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  const productId = params.id;

  return (
    <>
      <Breadcrumb title={"Product Page"} />
      <section className="section-product padding-tb-50">
        <div className="container">
          <Row>
            <ProductFullwidth productId={productId} />
          </Row>
        </div>
      </section>
      <RelatedSlider productId={productId} />
    </>
  );
};

export default Page;
