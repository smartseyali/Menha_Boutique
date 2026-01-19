"use client"
import React, { useEffect } from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'
import { useDispatch } from 'react-redux'
import { setSelectedCategory, setSearchTerm, setSelectedTags } from '@/store/reducer/filterReducer'

const AllCategoriesPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Reset all filters to show all categories/products
    dispatch(setSelectedCategory([]));
    dispatch(setSearchTerm(""));
    dispatch(setSelectedTags([]));
  }, [dispatch]);

  return (
    <>
      <Breadcrumb title={"All Categories"} />
      <ShopFullwidth col={3} itemsPerPage={1000} />
    </>
  )
}

export default AllCategoriesPage
