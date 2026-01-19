import React from 'react'
import useSWR from 'swr';
import fetcher from '../fetcher/Fetcher';
import StarRating from '../stars/StarRating';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';

const CategoryPopup = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
    closeCategoryPopup,
    isPopupOpen }: any) => {
    const { data, error } = useSWR("/api/category-slider", fetcher, { onSuccess, onError });

    const { data: RelatedProducts } = useSWR("/api/related-products", fetcher, { onSuccess, onError });

    if (error) return <div>Failed to load products</div>;
    if (!data) return <div></div>

    const getData = () => {
        if (hasPaginate) return data.data;
        else return data;
    };

    if (!RelatedProducts) return <div></div>;

    const getRelatedData = () => {
        if (hasPaginate) return RelatedProducts.data;
        else return RelatedProducts;
    };

    return (
        <>
            <div className={`bb-category-sidebar ${isPopupOpen ? "bb-open-category" : ""}`}>
                <div onClick={closeCategoryPopup} style={{ display: isPopupOpen ? "block" : "none" }} className="bb-category-overlay"></div>
                <div className="category-sidebar">
                    <button onClick={closeCategoryPopup} type="button" className="bb-category-close" title="Close"></button>
                    <div className="container-fluid">
                        <Row className="mb-minus-24">
                            <Col sm={12}>
                                <div className="bb-category-tags">
                                    <div className="sub-title">
                                        <h4>keywords</h4>
                                    </div>
                                    <div className="bb-tags">
                                        <ul>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Clothes</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Fruits</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Snacks</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Dairy</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Seafood</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Toys</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">perfume</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">jewelry</a>
                                            </li>
                                            <li>
                                                <a onClick={(e) => e.preventDefault()} href="#">Bags</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={12}>
                                <Row>
                                    <div className="col-12">
                                        <div className="sub-title">
                                            <h4>Explore Categories</h4>
                                        </div>
                                    </div>
                                    {getData().map((data: any, index: any) => (
                                        <div key={index} className="col-xl-2 col-md-4 col-sm-6 col-12 mb-24">
                                            <div className={`bb-category-box category-items-${data.num}`}>
                                                <div className="category-image">
                                                    <img src={data.image} alt="category" />
                                                </div>
                                                <div className="category-sub-contact">
                                                    <h5><Link href="/shop-left-sidebar-col-3">{data.name}</Link></h5>
                                                    <p>{data.item} items</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Row>
                            </Col>
                            <Col sm={12}>
                                <Row>
                                    <div className="col-12">
                                        <div className="sub-title">
                                            <h4>Related products</h4>
                                        </div>
                                    </div>
                                    {getRelatedData().map((data: any, index: any) => (
                                        <Col lg={4} md={6} sm={6} key={index} className="col-12 mb-24">
                                            <div className="bb-category-cart">
                                                <a onClick={(e) => e.preventDefault()} href="#" className="pro-img">
                                                    <img src={data.image} alt="new-product-1" />
                                                </a>
                                                <div className="side-contact">
                                                    <h4 className="bb-pro-title"><Link href={`/product/${data.id}`}>{data.title}</Link></h4>
                                                    <span className="bb-pro-rating">
                                                        <StarRating rating={data.rating} />
                                                    </span>
                                                    <div className="inner-price">
                                                        <span className="new-price">₹{data.newPrice.toFixed(2)}</span>{' '}
                                                        {data.oldPrice && <span className="old-price">₹{typeof data.oldPrice === 'number' ? data.oldPrice.toFixed(2) : data.oldPrice}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CategoryPopup
