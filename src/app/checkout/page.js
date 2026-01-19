"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Checkout from '@/components/login/Checkout'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Checkout"} />
      <Checkout />
    </>
  )
}

export default page
