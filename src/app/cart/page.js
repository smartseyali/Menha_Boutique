"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Cart from '@/components/cart/cart-section/Cart'
import CartSlider from '@/components/deal-slider/CartSlider'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Cart"} />
      <Cart />
      <CartSlider />
    </>
  )
}

export default page
