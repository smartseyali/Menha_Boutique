"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopDetailBanner from '@/components/banner/ShopDetailBanner'
import ShopRight from '@/components/shop/ShopRight'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopDetailBanner />
      <ShopRight col={3} />
    </>
  )
}

export default page
