"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopCategorySlider from '@/components/category/ShopCategorySlider'
import ShopFullwidth from '@/components/shop/ShopFullwidth'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopCategorySlider />
      <ShopFullwidth width={"width-50"} />
    </>
  )
}

export default page
