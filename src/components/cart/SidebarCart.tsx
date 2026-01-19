
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import QuantitySelector from '../quantity-selector/QuantitySelector';
import fetcher from '../fetcher/Fetcher';
import useSWR from 'swr';
import ProductItemCard from '../item/ProductItemCard';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { removeItemFromCart } from '@/utils/cartOperations';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';

const SidebarCart = ({
    onSuccess = () => { },
    hasPaginate = false,
    onError = () => { },
    isCartOpen,
    closeCart }: any) => {

    const cartSlice = useSelector((state: RootState) => state.cart?.items);
    const [subTotal, setSubTotal] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (cartSlice.length === 0) {
            setSubTotal(0);

            return;
        }

        const subtotal = cartSlice.reduce(
            (acc, item) => acc + item.newPrice * item.quantity,
            0
        );
        setSubTotal(subtotal);


    }, [cartSlice]);

    const total = subTotal;

    const handleRemoveItem = async (data: any) => {
        try {
            // Use cartItemId if available, otherwise use id
            const cartItemId = data.cartItemId || data.id;
            await removeItemFromCart(dispatch, cartItemId);
            showSuccessToast("Item removed from cart");
        } catch (error: any) {
            console.error('Error removing item:', error);
            showErrorToast(error.message || "Failed to remove item from cart");
        }
    }
    return (
        <>
            <div onClick={closeCart} style={{ display: isCartOpen ? "block" : "none", zIndex: 1999 }} className="bb-side-cart-overlay"></div>
            <div className={`bb-side-cart ${isCartOpen ? "bb-open-cart" : ""}`} style={{ zIndex: 2000 }}>
                <Row className="row h-full" style={{ height: '100%' }}>
                    <Col md={12} className="col-12" style={{ height: '100%' }}>
                        <div className="bb-inner-cart" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="bb-top-contact" style={{ flexShrink: 0 }}>
                                <div className="bb-cart-title">
                                    <h4>My cart</h4>
                                    <a onClick={closeCart} className="bb-cart-close" title="Close Cart"></a>
                                </div>
                            </div>
                            <div className="bb-cart-box item" style={{ flex: 1, overflowY: 'auto' }}>
                                {cartSlice.length === 0 ? (<div>Your cart is empty</div>) : (
                                    <ul className="bb-cart-items">
                                        {cartSlice.map((data: any, index: any) => (
                                            <li key={index} className="cart-sidebar-list">
                                                <a onClick={() => handleRemoveItem(data)} className="cart-remove-item"><i className="ri-close-line"></i></a>
                                                <a onClick={(e) => e.preventDefault()} href="#" className="bb-cart-pro-img">
                                                    <img src={data.image} alt="product-img-1" />
                                                </a>
                                                <div className="bb-cart-contact">
                                                    <Link href={`/product/${data.id}`} className="bb-cart-sub-title">{data.title}</Link>
                                                    <span className="cart-price"><span className="new-price">₹{(data.newPrice * data.quantity).toFixed(2)}</span>{' '} x {data.weight}</span>
                                                      <div className="qty-plus-minus">
                                                          <QuantitySelector id={data.id} quantity={data.quantity} cartItemId={data.cartItemId} />
                                                      </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="bb-bottom-cart" style={{ flexShrink: 0, position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 10, borderTop: '1px solid #eee' }}>
                                {cartSlice.length ? (
                                    <div className="cart-sub-total">
                                        <table className="table cart-table">
                                            <tbody>
                                                <tr>
                                                    <td className="title">Sub-Total :</td>
                                                    <td className="price">₹{subTotal.toFixed(2)}</td>
                                                </tr>

                                                <tr>
                                                    <td className="title">Total :</td>
                                                    <td className="price">₹{total.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : <></>}
                                <div className="cart-btn">
                                    <Link href="/checkout" className="bb-btn-2" onClick={closeCart}>Buy Now <i className="ri-arrow-right-line"></i></Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div >
        </>
    )
}

export default SidebarCart;
