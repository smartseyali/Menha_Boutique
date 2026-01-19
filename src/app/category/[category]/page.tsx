"use client"
import React, { useEffect, use } from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'
import { useDispatch } from 'react-redux'
import { setSelectedCategory, setSearchTerm } from '@/store/reducer/filterReducer'

const CategoryPage = ({ params }: { params: Promise<{ category: string }> }) => {
  const dispatch = useDispatch();
  const { category } = use(params);
  const decodedCategory = decodeURIComponent(category);

  useEffect(() => {
    dispatch(setSelectedCategory([decodedCategory]));
    dispatch(setSearchTerm("")); 
  }, [decodedCategory, dispatch]);

  return (
    <>
      <Breadcrumb title={decodedCategory} />
      <ShopFullwidth col={3} itemsPerPage={1000} />
    </>
  )
}

export default CategoryPage
