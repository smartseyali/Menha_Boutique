"use client"
import React, { useMemo, useState } from 'react'
import BlogCard from './blog-card/BlogCard'
import Articles from './recent-articles/Articles'
import useSWR from 'swr'
import fetcher from '../fetcher/Fetcher'
import { RootState } from '@/store'
import { useSelector } from 'react-redux'
import { Col } from 'react-bootstrap'
import Spinner from '../spinner/Spinner'

const Blog = () => {
  const { selectedCategory } = useSelector((state: RootState) => state.filter)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const postData = useMemo(() => ({
    selectedCategory,
    limit: itemsPerPage,
    page: currentPage
  }), [
    selectedCategory,
    itemsPerPage,
    currentPage
  ])
  const { data, error } = useSWR(["/api/blog-content", postData], ([url, postData]) => fetcher(url, postData));

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (error) return <div>Failed to load products</div>;
  
  return (
    <>
      <Col xl={4} className="col-lg-5 col-12 mb-24">
        <Articles selectedCategory={selectedCategory} />
      </Col>
      {!data ? (<Col xl={8} sm={12}><Spinner /></Col>) : (
      <Col xl={8} className="col-lg-7 col-12 mb-24">
        <BlogCard categoryData={data} handlePageChange={handlePageChange} itemsPerPage={itemsPerPage} currentPage={currentPage} />
      </Col>
      )}
    </>
  )
}

export default Blog
