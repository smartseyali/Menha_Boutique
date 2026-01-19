"use client";
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';
import ShopCategorySlider from '@/components/category/ShopCategorySlider';
import Shop from '@/components/shop/Shop';

const page = () => {
  return (
    <>
      <Breadcrumb title={"Shop Page"} />
      <ShopCategorySlider />
      <Shop col={4} />
    </>
  )
}

export default page
