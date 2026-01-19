"use client"
import React, { useEffect } from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'
import { useDispatch } from 'react-redux'
import { setSelectedTags, setSearchTerm, setSelectedCategory } from '@/store/reducer/filterReducer'

const SpecialsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSelectedTags(['Pattikadai Special']));
    dispatch(setSearchTerm(""));
    dispatch(setSelectedCategory([]));
  }, [dispatch]);

  return (
    <>
      <Breadcrumb title={"Pattikadai Special"} />
      <ShopFullwidth col={3} itemsPerPage={1000} filterType="special" />
    </>
  )
}

export default SpecialsPage
