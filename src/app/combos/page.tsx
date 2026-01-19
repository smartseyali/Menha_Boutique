"use client"
import React, { useEffect } from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'
import { useDispatch } from 'react-redux'
import { setSelectedTags, setSearchTerm, setSelectedCategory } from '@/store/reducer/filterReducer'

const CombosPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSelectedTags(['Special Combo']));
    dispatch(setSearchTerm(""));
    dispatch(setSelectedCategory([]));
  }, [dispatch]);

  return (
    <>
      <Breadcrumb title={"Special Combo"} />
      <ShopFullwidth col={3} itemsPerPage={1000} filterType="combo" />
    </>
  )
}

export default CombosPage
