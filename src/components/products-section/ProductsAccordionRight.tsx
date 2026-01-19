"use client"
import React, { useCallback, useState } from 'react'
import ShopSidebar from '../shop/sidebar-section/ShopSidebar'
import ProductsDetails from './Products-Detail/ProductsDetails'
import ProductsAccordionTabs from './Products-Tabs/ProductsAccordionTabs'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setRange, setSelectedCategory, setSelectedColor, setSelectedTags, setSelectedWeight } from '@/store/reducer/filterReducer'
import { Col } from 'react-bootstrap'

const ProductsAccordionRight = () => {
  const { minPrice, maxPrice, selectedCategory, selectedColor, selectedTags, selectedWeight, } = useSelector((state: RootState) => state.filter)
  const dispatch = useDispatch()

  const handlePriceChange = useCallback(
    (min: number, max: number) => {
      dispatch(setRange({ min, max }));
    },
    [dispatch]
  );

  const handleCategoryChange = (category: any) => {
    const updatedCategory = selectedCategory.includes(category)
      ? selectedCategory.filter((cat: any) => cat !== category)
      : [...selectedCategory, category];
    dispatch(setSelectedCategory(updatedCategory));
  };

  const handleWeightChange = (weight: any) => {
    const updatedweight = selectedWeight.includes(weight)
      ? selectedWeight.filter((wet: any) => wet !== weight)
      : [...selectedWeight, weight];
    dispatch(setSelectedWeight(updatedweight));
  };

  const handleColorChange = (color: any) => {
    const updatedcolor = selectedColor.includes(color)
      ? selectedColor.filter((clr: any) => clr !== color)
      : [...selectedColor, color];
    dispatch(setSelectedColor(updatedcolor));
  };

  const handleTagsChange = (tag: any) => {
    const updatedtag = selectedTags.includes(tag)
      ? selectedTags.filter((tg: any) => tg !== tag)
      : [...selectedTags, tag];
    dispatch(setSelectedTags(updatedtag));
  };
  return (
    <>

      <Col lg={9} sm={12} className="mb-24">
        <ProductsDetails />
        <ProductsAccordionTabs />
      </Col>
      <Col lg={3} sm={12} className="mb-24">
        <ShopSidebar
          handlePriceChange={handlePriceChange}
          handleCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
          handleColorChange={handleColorChange}
          selectedColor={selectedColor}
          handleTagsChange={handleTagsChange}
          selectedTags={selectedTags}
          handleWeightChange={handleWeightChange}
          selectedWeight={selectedWeight}
          max={maxPrice}
          min={minPrice}
        />
      </Col>
    </>
  )
}

export default ProductsAccordionRight
