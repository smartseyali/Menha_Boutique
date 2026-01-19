"use client"
import React, { useEffect, use } from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ShopFullwidth from '@/components/shop/ShopFullwidth'
import { useDispatch } from 'react-redux'
import { setSearchTerm, setSelectedCategory } from '@/store/reducer/filterReducer'

const SearchPage = ({ params }: { params: Promise<{ query: string }> }) => {
  const dispatch = useDispatch();
  const { query } = use(params);
  const decodedQuery = decodeURIComponent(query);

  useEffect(() => {
    dispatch(setSearchTerm(decodedQuery));
    dispatch(setSelectedCategory([])); 
  }, [decodedQuery, dispatch]);

  return (
    <>
      <Breadcrumb title={`Search: ${decodedQuery}`} />
      <ShopFullwidth col={3} itemsPerPage={1000} />
    </>
  )
}

export default SearchPage
