"use client";
import { useParams } from "next/navigation";
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import OrderPage from '@/components/order-page/OrderPage'
import React from 'react'

export default function Page() { 
  const params = useParams();
  const id = params.id;
  return (
    <>
      <Breadcrumb title={"My Orders Details"} />
      <OrderPage id={id} />
    </>
  )
}
