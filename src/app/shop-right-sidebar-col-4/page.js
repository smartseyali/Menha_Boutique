"use client"
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopCategorySlider from '@/components/category/ShopCategorySlider'
import ShopRight from '@/components/shop/ShopRight'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopCategorySlider />
      <ShopRight col={3} />
    </>
  )
}

export default page
