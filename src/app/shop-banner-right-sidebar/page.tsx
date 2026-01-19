"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'
import ShopListRight from '@/components/shop/ShopListRight'

const Page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <ShopListRight col={4} />
    </>
  )
};

export default Page
