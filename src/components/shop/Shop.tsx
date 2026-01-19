"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ShopSidebar from './sidebar-section/ShopSidebar'
import fetcher from '../fetcher/Fetcher'
import useSWR from 'swr'
import ShopProductItemCard from '../item/ShopProductItemCard'
import { Fade } from 'react-awesome-reveal'
import { setRange, setSearchTerm, setSelectedCategory, setSelectedColor, setSelectedTags, setSelectedWeight, setSortOption } from '@/store/reducer/filterReducer'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store'
import Paginantion from '../paginantion/Paginantion'
import Spinner from '../spinner/Spinner'
import { Col, Row } from 'react-bootstrap'

const Shop = ({
  col,
  lg
}: any) => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(false);
  const { minPrice, maxPrice, range, selectedCategory, selectedColor, selectedTags, selectedWeight, sortOption, searchTerm } = useSelector((state: RootState) => state.filter)
  const itemsPerPage = 12;
  const postData = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    selectedCategory,
    sortOption,
    minPrice,
    maxPrice,
    range,
    selectedWeight,
    selectedColor,
    selectedTags,
    searchTerm
  }), [
    currentPage,
    selectedCategory,
    sortOption,
    minPrice,
    maxPrice,
    range,
    selectedWeight,
    selectedColor,
    selectedTags,
    itemsPerPage,
    searchTerm
  ])

  const { data, error } = useSWR(["/api/all-arrivals", postData], ([url, postData]) => fetcher(url, postData));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortOption, range, selectedWeight, selectedColor, selectedTags]);

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
    }, [dispatch]
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

  if (error) return <div>Failed to load products</div>;

  return (
    <section className="section-shop padding-b-50">
      <div className="container">
        <Row className="mb-minus-24">
          <Col lg={3} col={12} className="mb-24">
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
              min={minPrice}
              max={maxPrice}
            />
          </Col>

          <Col lg={9} col={12} className="mb-24">
            <div className="bb-shop-pro-inner">
              <Row className="mb-minus-24">
                <Col sm={12}>
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
                          <select style={{ border: "none", background: "none", textWrap: "wrap"}} defaultValue="" className="custom-select custom-select-two" onChange={handleSortChange}>
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
                </Col>
                {!data?.data ? (<div><Spinner /></div>) : (
                  <>
                    {/* Mobile: horizontal scroll with 2 columns visible */}
                    <div className="bb-scrollable-row d-flex d-md-none">
                      {data?.data.map((items: any, index: number) => (
                        <ShopProductItemCard data={items} key={index} />
                      ))}
                    </div>

                    {/* Desktop/Tablet: keep existing grid */}
                    <Fade triggerOnce direction='up' duration={1000} delay={200} className={`d-none d-md-block col-md-${col} ${lg} col-lg-4 col-6 mb-24 bb-product-box pro-bb-content ${isGridView ? "width-100 pro-bb-content" : ""}`}>
                      {data?.data.map((items: any, index: number) => (
                        <ShopProductItemCard data={items} key={index} />
                      ))}
                    </Fade>
                  </>
                )}
                <Col sm={12}>
                  {!data?.data.length ? (<div style={{ textAlign: "center" }}>Products is not found.</div>) : (
                    <div className="bb-pro-pagination">
                      <p>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, data?.totalItems)} of {data?.totalItems} item(s)</p>
                      <Paginantion currentPage={currentPage} totalPages={data?.totalPages} onPageChange={handlePageChange} />
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default Shop
