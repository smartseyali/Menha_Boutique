"use client"
import React, { useMemo, useState } from 'react'
import BlogCard from './blog-card/BlogCard'
import useSWR from 'swr'
import fetcher from '../fetcher/Fetcher'
import { Col } from 'react-bootstrap'
import Spinner from '../spinner/Spinner'

const BlogFullwidth = ({ col }: any) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const postData = useMemo(() => ({
        limit: itemsPerPage,
        page: currentPage
    }), [
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
            {!data ? (<Col sm={12}><Spinner /></Col>) : (
                <div className='col-12'>
                    <BlogCard categoryData={data} handlePageChange={handlePageChange} itemsPerPage={itemsPerPage} currentPage={currentPage} col={col} />
                </div>
            )}
        </>
    )
}

export default BlogFullwidth
