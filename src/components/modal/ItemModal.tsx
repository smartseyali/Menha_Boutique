import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import Modal from 'react-bootstrap/Modal'
import StarRating from '../stars/StarRating'
import QuantitySelector from '../quantity-selector/QuantitySelector'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify'
import ZoomProductImage from '../products-section/zoom-product-img/ZoomProductImage'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { addItemToCart, updateCartItemQuantity } from '@/utils/cartOperations'

interface Item {
    id: number;
    title: string;
    newPrice: number;
    weight: string;
    image: string;
    imageTwo: string;
    date: string;
    status: string;
    rating: number;
    oldPrice: number;
    location: string;
    brand: string;
    sku: number;
    category: string;
    quantity: number;
    attributes?: any[];
    description?: string;
}

const ItemModal = ({
    closeItemModal,
    isModalOpen,
    data
}: any) => {
    const router = useRouter();
    const cartSlice = useSelector((state: RootState) => state.cart?.items);
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    
    const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [selectedOldPrice, setSelectedOldPrice] = useState<number | null>(null);

    useEffect(() => {
        if (data) {
            // Reset state when data changes
            setQuantity(1);
            
            if (data.attributes && data.attributes.length > 0) {
                const defaultIndex = data.attributes.findIndex((attr: any) => attr.isDefault);
                const selectedIndex = defaultIndex >= 0 ? defaultIndex : 0;
                setActiveIndex(selectedIndex);
                const defaultAttr = data.attributes[selectedIndex];
                setSelectedAttribute(defaultAttr);
                setSelectedPrice(defaultAttr.price);
                setSelectedOldPrice(defaultAttr.oldPrice);
            } else {
                setActiveIndex(0);
                setSelectedAttribute(null);
                setSelectedPrice(data.newPrice || 0);
                setSelectedOldPrice(data.oldPrice || null);
            }
        }
    }, [data]);

    const handleAttributeClick = (index: number) => {
        setActiveIndex(index);
        if (data?.attributes && data.attributes[index]) {
            const attr = data.attributes[index];
            setSelectedAttribute(attr);
            setSelectedPrice(attr.price);
            setSelectedOldPrice(attr.oldPrice);
        }
    };

    const handleCart = async (itemData: Item) => {
        try {
            const productToAdd = {
                ...itemData,
                newPrice: selectedPrice || itemData.newPrice,
                oldPrice: selectedOldPrice || itemData.oldPrice,
                // Add selected attribute info if needed
            };

            const existingItem = cartSlice?.find((item: any) => item.productId === itemData.id || item.id === itemData.id);

            if (!existingItem) {
                await addItemToCart(dispatch, productToAdd, quantity);
                showSuccessToast("Item added to cart");
            } else {
                if (existingItem.cartItemId) {
                    const newQuantity = existingItem.quantity + quantity;
                    await updateCartItemQuantity(dispatch, existingItem.cartItemId, newQuantity);
                    showSuccessToast("Item quantity updated in cart");
                } else {
                    // Fallback for guest or if cartItemId missing
                    await addItemToCart(dispatch, productToAdd, quantity);
                    showSuccessToast("Item added to cart");
                }
            }
            // Optional: Close modal after adding to cart
            // closeItemModal(); 
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            showErrorToast(error.message || "Failed to add item to cart");
        }
    };

    const handleBuyNow = async (itemData: Item) => {
        try {
            const productToAdd = {
                ...itemData,
                newPrice: selectedPrice || itemData.newPrice,
                oldPrice: selectedOldPrice || itemData.oldPrice,
            };

            const existingItem = cartSlice?.find((item: any) => item.productId === itemData.id || item.id === itemData.id);

            if (!existingItem) {
                await addItemToCart(dispatch, productToAdd, quantity);
            } else {
                if (existingItem.cartItemId) {
                    const newQuantity = existingItem.quantity + quantity;
                    await updateCartItemQuantity(dispatch, existingItem.cartItemId, newQuantity);
                } else {
                    await addItemToCart(dispatch, productToAdd, quantity);
                }
            }
            closeItemModal();
            router.push('/checkout');
        } catch (error: any) {
            console.error('Error adding to cart for buy now:', error);
            showErrorToast(error.message || "Failed to process buy now.");
        }
    };

    // Calculate display price
    const displayPrice = selectedPrice > 0 ? selectedPrice : (data?.newPrice || 0);
    const displayOldPrice = selectedOldPrice || data?.oldPrice;

    return (
        <Fade triggerOnce duration={500} delay={100}>
            <Modal show={isModalOpen} centered onHide={closeItemModal} keyboard={false} className={`modal fade quickview-modal`} id="bry_quickview_modal" tabIndex={-1} role="dialog">
                <div className="modal-content">
                    <button onClick={closeItemModal} type="button" className="qty-close" data-bs-dismiss="modal" aria-label="Close"
                        title="Close"></button>
                    <Modal.Body>
                        <Row className="mb-minus-24">
                            <Col xs={12} sm={12} md={5} className="mb-24">
                                <div className="single-pro-img single-pro-img-no-sidebar">
                                    <div className="single-product-scroll">
                                        <div className="single-slide zoom-image-hover">
                                            <ZoomProductImage className="img-responsive" src={data?.image} alt="product-img-1" />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={7} className="mb-24">
                                <div className="quickview-pro-content">
                                    <h5 className="bb-quick-title">
                                        <Link href={`/product/${data?.id}`}>{data?.title}</Link>
                                    </h5>
                                    <StarRating rating={data?.rating} />
                                    <div className="bb-quickview-desc">{data?.description || "No description available."}</div>
                                    <div className="bb-quickview-price">
                                        <span className="new-price">₹{(displayPrice).toFixed(2)}</span>
                                        {displayOldPrice && displayOldPrice > displayPrice && (
                                            <span className="old-price">₹{typeof displayOldPrice === 'number' ? displayOldPrice.toFixed(2) : displayOldPrice}</span>
                                        )}
                                    </div>
                                    
                                    {data?.attributes && data.attributes.length > 0 && (
                                        <div className="bb-pro-variation">
                                            <ul>
                                                {data.attributes.map((attr: any, index: number) => (
                                                    <li key={index} onClick={() => handleAttributeClick(index)} className={activeIndex === index ? "active" : ""}>
                                                        <a className="bb-opt-sz" style={{cursor: 'pointer'}}>{attr.attributeValue}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    <div className="bb-quickview-qty">
                                        <div className="qty-plus-minus">
                                            <QuantitySelector setQuantity={setQuantity} quantity={quantity} id={data?.id} />
                                        </div>
                                        <div className="bb-quickview-cart">
                                            <button onClick={() => handleCart(data)} type="button" className="bb-btn-1">
                                                <i className="ri-shopping-bag-line"></i>Add To Cart
                                            </button>
                                            <button onClick={() => handleBuyNow(data)} type="button" className="bb-btn-1" style={{ marginLeft: '10px', backgroundColor: '#333', borderColor: '#333' }}>
                                                <i className="ri-shopping-cart-2-line"></i>Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                </div>
            </Modal>
        </Fade>
    )
}

export default ItemModal
