import React, { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr';
import fetcher from '@/components/fetcher/Fetcher';
import ProductItemCard from '@/components/item/ProductItemCard';
import { Fade } from 'react-awesome-reveal';
import ShopFullwidthSidebar from '../sidebar-section/ShopFullwidthSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setRange, setSelectedCategory, setSelectedColor, setSelectedTags, setSelectedWeight, setSortOption } from '@/store/reducer/filterReducer';
import Paginantion from '@/components/paginantion/Paginantion';
import { Col, Row } from 'react-bootstrap';
import Spinner from '@/components/spinner/Spinner';

const ShopFullwidthProducts = ({
    lg,
    col,
    colfive = '',
    width = '',
    itemsPerPage = 12,
    filterType,
}: any) => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [isGridView, setIsGridView] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { selectedCategory, selectedColor, selectedTags, selectedWeight, sortOption, maxPrice, minPrice, range, searchTerm } = useSelector((state: RootState) => state.filter)
    
    // Choose endpoint based on filterType
    const endpoint = filterType === 'bestselling' ? "/api/bestselling" : "/api/all-product?limit=1000";
    
    // Fetch products
    const { data: allProducts, error } = useSWR(endpoint, fetcher);

    const filteredProducts = useMemo(() => {
        if (!allProducts || !Array.isArray(allProducts)) return [];
        
        let result = [...allProducts];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter((product: any) => 
                (product.title && product.title.toLowerCase().includes(lowerTerm)) || 
                (product.category && product.category.toLowerCase().includes(lowerTerm))
            );
        }

        if (selectedCategory && selectedCategory.length > 0) {
             result = result.filter((product: any) => selectedCategory.includes(product.category));
        }

        // Filter based on filterType
        if (filterType === 'special') {
             result = result.filter((product: any) => product.isSpecial);
        } else if (filterType === 'combo') {
             result = result.filter((product: any) => product.isCombo);
        }

        return result;
    }, [allProducts, searchTerm, selectedCategory, filterType]);

    const handleSortChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            dispatch(setSortOption(event.target.value));
            setCurrentPage(1);
        },
        [dispatch]
    );

    const handlePriceChange = useCallback(
        (min: number, max: number) => {
            dispatch(setRange({ min, max }));
            setCurrentPage(1);
        },
        [dispatch]
    );

    const handleCategoryChange = (category: any) => {
        const updatedCategory = selectedCategory.includes(category)
            ? selectedCategory.filter((cat) => cat !== category)
            : [...selectedCategory, category];
        dispatch(setSelectedCategory(updatedCategory));
        setCurrentPage(1);
    };

    const handleWeightChange = (weight: any) => {
        const updatedweight = selectedWeight.includes(weight)
            ? selectedWeight.filter((wet) => wet !== weight)
            : [...selectedWeight, weight];
        console.log(updatedweight);
        dispatch(setSelectedWeight(updatedweight));
        setCurrentPage(1);
    };

    const handleColorChange = (color: any) => {
        const updatedcolor = selectedColor.includes(color)
            ? selectedColor.filter((clr) => clr !== color)
            : [...selectedColor, color];
        dispatch(setSelectedColor(updatedcolor));
        setCurrentPage(1);
    };

    const handleTagsChange = (tag: any) => {
        const updatedtag = selectedTags.includes(tag)
            ? selectedTags.filter((tg) => tg !== tag)
            : [...selectedTags, tag];
        dispatch(setSelectedTags(updatedtag));
        setCurrentPage(1);
    };

    const toggleView = (isGrid: any) => {
        setIsGridView(isGrid);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const openSidebar = () => {
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Handle loading and error states
    if (error) {
        console.error("Error loading products:", error);
        return <div style={{ textAlign: "center", padding: "20px" }}>Failed to load products. Please try again later.</div>;
    }

    // Ensure data has the correct structure
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <div className="bb-shop-pro-inner">
                <Row className="mb-minus-24">
                    {/* <Col sm={12}>
                        <div className="bb-pro-list-top">
                            <Row>
                                <Col className='col-6'>
                                    <div className="bb-bl-btn">
                                        <button onClick={() => toggleView(false)} type="button" className={`grid-btn btn-grid-100 ${!isGridView ? "active" : ""}`}>
                                            <i className="ri-apps-line"></i>
                                        </button>
                                        <button onClick={() => toggleView(true)} type="button" className={`grid-btn btn-grid-100 ${isGridView ? "active" : ""}`}>
                                            <i className="ri-list-unordered"></i>
                                        </button>
                                    </div>
                                </Col>
                                <Col className='col-6'>
                                    <div className="bb-select-inner">
                                        <select style={{ border: "none", background: "none", textWrap: "wrap" }} defaultValue="" className="custom-select custom-select-two" onChange={handleSortChange}>
                                            <option value="1">Sort by</option>
                                            <option value="2">Position</option>
                                            <option value="3">Relevance</option>
                                            <option value="4">Name, A to Z</option>
                                            <option value="5">Name, Z to A</option>
                                            <option value="6">Price, low to high</option>
                                            <option value="7">Price, high to low</option>
                                        </select>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col> */}
                    {!allProducts ? (
                        <Spinner />
                    ) : (
                        <>
                            {/* Unified Grid View for all screen sizes */}
                            {Array.isArray(paginatedProducts) && paginatedProducts.length > 0 ? (
                                paginatedProducts.map((items: any, index: number) => (
                                    <div className={`col-lg-${col} ${colfive} ${width} ${lg} col-md-4 col-6 mb-24 ${isGridView ? "width-100" : ""}`} key={index}>
                                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                                            <ProductItemCard data={items} />
                                        </Fade>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: "center", padding: "20px", width: "100%" }}>No products found.</div>
                            )}
                        </>
                    )}
                    <Col sm={12}>
                        {!Array.isArray(paginatedProducts) || paginatedProducts.length === 0 ? (
                            <div style={{ textAlign: "center" }}>Products not found.</div>
                        ) : (
                            <div className="bb-pro-pagination">
                                <p>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} item(s)</p>
                                <Paginantion currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
            <ShopFullwidthSidebar
                handleTagsChange={handleTagsChange}
                selectedTags={selectedTags}
                handleColorChange={handleColorChange}
                selectedColor={selectedColor}
                handleWeightChange={handleWeightChange}
                selectedWeight={selectedWeight}
                handleCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
                closeSidebar={closeSidebar}
                isSidebarOpen={isSidebarOpen}
                handlePriceChange={handlePriceChange}
                min={minPrice}
                max={maxPrice}
            />
        </>
    )
}

export default ShopFullwidthProducts
