"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Shop from '@/components/shop/Shop'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <Shop col={4} />
    </>
  )
}

export default page
