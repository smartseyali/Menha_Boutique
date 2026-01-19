"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import TrackOrders from '@/components/track-order/TrackOrders'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Track order"} />
      <TrackOrders />
    </>
  )
}

export default page
