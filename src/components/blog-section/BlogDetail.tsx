"use client"
import React, { useMemo } from 'react'
import Articles from './recent-articles/Articles'
import BlogDetails from './blog-details/BlogDetails'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import useSWR from 'swr'
import fetcher from '../fetcher/Fetcher'
import { Col } from 'react-bootstrap'

const BlogDetail = () => {
  const { selectedCategory } = useSelector((state: RootState) => state.filter)

  const postData = useMemo(() => ({
    selectedCategory,
  }), [
    selectedCategory,
  ])
  const { error } = useSWR(["/api/blog-content", postData], ([url, postData]) => fetcher(url, postData));

  if (error) return <div>Failed to load products</div>;

  return (
    <>
      <Col xl={4} className="col-lg-5 col-12 mb-24">
        <Articles selectedCategory={selectedCategory} />
      </Col>
      <Col xl={8} className="col-lg-7 col-12 mb-24">
        <BlogDetails />
      </Col>
    </>
  )
}

export default BlogDetail
