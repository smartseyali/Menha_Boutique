import React from 'react'
import ShopSidebar from './ShopSidebar'

const ShopFullwidthSidebar = ({
    closeSidebar,
    isSidebarOpen,
    handleCategoryChange,
    selectedCategory,
    handleWeightChange,
    selectedWeight,
    handleColorChange,
    selectedColor,
    handleTagsChange,
    selectedTags,
    handlePriceChange,
    min,
    max,
}: any) => {
    return (
        <>
            <div onClick={closeSidebar} style={{ display: isSidebarOpen ? "block" : "none" }} className="bb-shop-overlay"></div>
            <div className={`col-lg-3 col-12 bb-shop-sidebar ${isSidebarOpen ? "bb-shop-sidebar-open" : ""}`}>
                <div className="sidebar-filter-title">
                    <h5>Filters</h5>
                    <a onClick={closeSidebar} className="filter-close">×</a>
                </div>
                <ShopSidebar
                    handleTagsChange={handleTagsChange}
                    selectedTags={selectedTags}
                    handleColorChange={handleColorChange}
                    selectedColor={selectedColor}
                    handleWeightChange={handleWeightChange}
                    selectedWeight={selectedWeight}
                    handleCategoryChange={handleCategoryChange}
                    selectedCategory={selectedCategory}
                    handlePriceChange={handlePriceChange}
                    min={min}
                    max={max}
                />
            </div>
        </>
    )
}

export default ShopFullwidthSidebar
