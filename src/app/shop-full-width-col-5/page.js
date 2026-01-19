"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopCategorySlider from '@/components/category/ShopCategorySlider'
import ShopFullwidth from '@/components/shop/ShopFullwidth'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopCategorySlider />
      <ShopFullwidth colfive={"bb-col-5 col-lg-3"} itemsPerPage={10} />
    </>
  )
}

export default page
