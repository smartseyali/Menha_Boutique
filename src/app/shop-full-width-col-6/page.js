"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopCategorySlider from '@/components/category/ShopCategorySlider'
import ShopFullwidth from '@/components/shop/ShopFullwidth'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopCategorySlider />
      <ShopFullwidth col={3} lg={"bb-col-6"} itemsPerPage={12} />
    </>
  )
}

export default page
