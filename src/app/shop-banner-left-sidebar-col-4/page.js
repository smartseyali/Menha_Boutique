"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'
import Shop from '@/components/shop/Shop'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <Shop lg={"col-xl-3"} />
    </>
  )
}

export default page
