"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'

const BestSellingPage = () => {
  return (
    <>
      <Breadcrumb title={"Best Selling"} />
      <ShopFullwidth col={3} itemsPerPage={1000} filterType="bestselling" />
    </>
  )
}

export default BestSellingPage
