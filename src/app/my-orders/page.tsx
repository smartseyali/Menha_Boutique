"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import MyOrders from '@/components/my-orders/MyOrders'


const page = () => {
  return (
    <>
      <Breadcrumb title={"My Orders"} />
      <MyOrders />
    </>
  )
}

export default page
