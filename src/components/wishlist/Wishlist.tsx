"use client"
import React from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import WishlistItemCard from './wishlist-item/WishlistItemCard';
import { Col, Row } from 'react-bootstrap';

const Wishlist = () => {
    const wishlistItem = useSelector((state: RootState) => state.wishlist?.wishlist);

    return (
        <section className="section-wishlist padding-tb-50">
            <div className="container">
                <Row className="mb-minus-24 bb-wish-rightside">
                    {wishlistItem.length === 0 ? (<div style={{ textAlign: "center" }}>Your wishlist is empty</div>) : (
                        <>
                            {wishlistItem.map((data: any, index: number) => (
                                <Col lg={3} md={4} xs={6} key={index} className="mb-24 bb-wishlist">
                                    <WishlistItemCard data={data} />
                                </Col>
                            ))}
                        </>
                    )}
                </Row>
            </div>
        </section>
    )
}

export default Wishlist
