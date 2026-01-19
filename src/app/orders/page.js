"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Orders from '@/components/order-page/Orders'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Orders"} />
      <Orders />
    </>
  )
}

export default page
