"use client"
import React, { useCallback } from 'react'
import ShopSidebar from '../shop/sidebar-section/ShopSidebar'
import ProductsDetails from './Products-Detail/ProductsDetails'
import ProductsTabs from './Products-Tabs/ProductsTabs'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setRange, setSelectedCategory, setSelectedColor, setSelectedTags, setSelectedWeight } from '@/store/reducer/filterReducer'
import { Col } from 'react-bootstrap'

const Products = () => {
    const { minPrice, maxPrice, selectedCategory, selectedColor, selectedTags, selectedWeight } = useSelector((state: RootState) => state.filter)
    const dispatch = useDispatch()


    const handlePriceChange = useCallback(
        (min: number, max: number) => {
            dispatch(setRange({ min, max }));
        },
        [dispatch]
    );

    const handleCategoryChange = (category: any) => {
        const updatedCategory = selectedCategory.includes(category)
            ? selectedCategory.filter((cat) => cat !== category)
            : [...selectedCategory, category];
        dispatch(setSelectedCategory(updatedCategory));
    };

    const handleWeightChange = (weight: any) => {
        const updatedweight = selectedWeight.includes(weight)
            ? selectedWeight.filter((wet) => wet !== weight)
            : [...selectedWeight, weight];
        dispatch(setSelectedWeight(updatedweight));
    };

    const handleColorChange = (color: any) => {
        const updatedcolor = selectedColor.includes(color)
            ? selectedColor.filter((clr) => clr !== color)
            : [...selectedColor, color];
        dispatch(setSelectedColor(updatedcolor));
    };

    const handleTagsChange = (tag: any) => {
        const updatedtag = selectedTags.includes(tag)
            ? selectedTags.filter((tg) => tg !== tag)
            : [...selectedTags, tag];
        dispatch(setSelectedTags(updatedtag));
    };

    return (
        <>
            <Col lg={3} sm={12} className="mb-24">
                <ShopSidebar
                    handleCategoryChange={handleCategoryChange}
                    selectedCategory={selectedCategory}
                    handleColorChange={handleColorChange}
                    selectedColor={selectedColor}
                    handleWeightChange={handleWeightChange}
                    selectedWeight={selectedWeight}
                    handleTagsChange={handleTagsChange}
                    selectedTags={selectedTags}
                    min={minPrice}
                    max={maxPrice}
                    handlePriceChange={handlePriceChange}
                />
            </Col>
            <Col lg={9} sm={12} className="mb-24">
                <ProductsDetails />
                <ProductsTabs />
            </Col>
        </>
    )
}

export default Products
