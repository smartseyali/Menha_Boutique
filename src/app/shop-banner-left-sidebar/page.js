"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'
import ShopList from '@/components/shop/ShopList'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <ShopList col={4} />
    </>
  )
}

export default page
