"use client"
import { RootState } from '@/store'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StarRating from '../stars/StarRating'
import { removeCompareItem } from '@/store/reducer/compareSlice'
import { Col, Row } from 'react-bootstrap'

const Compare = () => {
    const compareItems = useSelector((state: RootState) => state.compare?.compare)
    const dispatch = useDispatch()

    const handleRemoveCompareItem = (data: any) => {
        dispatch(removeCompareItem(data.id))
    }

    return (
        <>
            <section className="section-compare padding-tb-50">
                <div className="container">
                    <Row>
                        <div className='col-12'>
                            {compareItems.length === 0 ? (
                                <div style={{ textAlign: "center" }}>Your compare list is empty</div>
                            ) : (
                                <div className="bb-compare">
                                    <ul className="bb-compare-main-box">
                                        <>
                                            <li className="bb-compare-inner-rows">
                                                <ul className="bb-compare-inner-box">
                                                    <li>
                                                        <div className="compare-pro-img">
                                                            <p>Products image</p>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Name</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Category</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Ratings</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Availability</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>location</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Brand</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>SKU</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Quantity</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title">
                                                            <h5>Weight</h5>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="compare-pro-title compare-description">
                                                            <h5>Description</h5>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </li>
                                            {compareItems.map((data, index) => (
                                                <li key={index} className="bb-compare-inner-rows bb-compare-box">
                                                    <ul className="bb-compare-inner-box">
                                                        <li className="inner-image">
                                                            <span className="bb-remove-compare">
                                                                <a onClick={() => handleRemoveCompareItem(data)} href="#">
                                                                    <i className="ri-close-circle-fill"></i>
                                                                </a>
                                                            </span>
                                                            <div className="compare-pro-img">
                                                                <img src={data.image} alt="products-4" />
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.title}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.category}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <span className="bb-pro-rating">
                                                                    <StarRating rating={data.rating} />
                                                                </span>
                                                                <p>({data.rating?.toString()} Review)</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p className={data.status === "In Stock" ? "in-stock" : "out-stock"}>{data.status}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.location}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.brand}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.sku}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.quantity}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-detail">
                                                                <p>{data.weight}</p>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="compare-pro-title">
                                                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit necessitatibus possimus libero enim.</p>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </li>
                                            ))}
                                        </>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Compare
