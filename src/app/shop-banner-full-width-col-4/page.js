"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'
import ShopFullwidth from '@/components/shop/ShopFullwidth'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <ShopFullwidth col={3} />
    </>
  )
}

export default page
