"use client"
import React, { useState } from 'react'
import StarRating from '../stars/StarRating'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';
import { addCompare } from '@/store/reducer/compareSlice';
import { addWishlist } from '@/store/reducer/wishlistSlice';
import ItemModal from '../modal/ItemModal';
import Link from 'next/link';
import { addItemToCart, incrementCartItem } from '@/utils/cartOperations';
import { setCartOpen } from '@/store/reducer/cartSlice';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/utils/authStorage';
import { addItemToWishlist, removeItemFromWishlist } from '@/utils/wishlistOperations';
import { removeWishlist } from '@/store/reducer/wishlistSlice';

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
}

const ProductItemCard = ({ data }: any) => {
    const router = useRouter();
    const dispatch = useDispatch()
    const cartSlice = useSelector((state: RootState) => state.cart?.items);
    const wishlistItem = useSelector((state: RootState) => state.wishlist?.wishlist);
    const compareItems = useSelector((state: RootState) => state.compare?.compare)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleProductClick = () => {
        router.push(`/product/${data.id}`);
    }

    const openItemModal = () => {
        setIsModalOpen(true)
    }

    const closeItemModal = () => {
        setIsModalOpen(false)
    }

    const handleCart = async (data: Item) => {
        setIsAddingToCart(true);
        try {
            const isItemInCart = cartSlice?.some((item: any) => item.productId === data.id || item.id === data.id);

            if (!isItemInCart) {
                await addItemToCart(dispatch, data, 1);
                showSuccessToast("Item added to cart");
            } else {
                await incrementCartItem(dispatch, data, cartSlice || []);
                showSuccessToast("Item quantity increased in cart");
            }
            dispatch(setCartOpen(true));
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            showErrorToast(error.message || "Failed to add item to cart. Please login.");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleWishlist = async (data: Item) => {
        try {
            const isItemInWishlist = wishlistItem.some(
                (item: Item) => item.id === data.id
            );
            
            if (!isItemInWishlist) {
                // Add to wishlist
                if (authStorage.isAuthenticated()) {
                    await addItemToWishlist(dispatch, data.id);
                } else {
                    dispatch(addWishlist(data));
                }
                showSuccessToast("Item added to wishlist");
            } else {
                // Remove from wishlist
                // Note: database requires wishlistItemId, but for local/toggle we might only have data.id or we need to find the item in wishlistItem array to get its ID if it came from DB
                
                if (authStorage.isAuthenticated()) {
                    // Find the item in the wishlist array to get its wishlistItemId if possible
                    const existingItem = wishlistItem.find((item: any) => item.id === data.id);
                    const idToRemove = (existingItem as any)?.wishlistItemId || data.id;
                    await removeItemFromWishlist(dispatch, idToRemove);
                } else {
                    dispatch(removeWishlist(data.id));
                }
                showSuccessToast("Item removed from wishlist");
            }
        } catch (error: any) {
             console.error('Error updating wishlist:', error);
             showErrorToast(error.message || "Failed to update wishlist.");
        }
    };

    const handleCompareItem = (data: Item) => {
        const isItemInCompare = compareItems.some(
            (item: Item) => item.id === data.id
        );

        if (!isItemInCompare) {
            dispatch(addCompare(data));
            showSuccessToast("Item added to compare list");
        } else {
            showErrorToast("Item already have to compare list");
        }
    };

    const handleBuyNow = async (data: Item) => {
        try {
            await incrementCartItem(dispatch, data, cartSlice || []);
            router.push('/checkout');
        } catch (error: any) {
            console.error('Error adding to cart for buy now:', error);
            showErrorToast(error.message || "Failed to process buy now.");
        }
    };

    return (
        <>
            <div className="bb-pro-box">
                <div className="bb-pro-img " onClick={handleProductClick} style={{ cursor: 'pointer' }}>
                    <span className="flags">
                        <span>{data.sale}</span>
                    </span>
                    <div className="inner-img">
                        <img 
                            className="main-img" 
                            src={data.image || '/assets/img/product/default.jpg'}
                            alt={data.title || 'product'}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
                            }}
                        />
                        <img 
                            className="hover-img" 
                            src={data.imageTwo || data.image || '/assets/img/product/default.jpg'}
                            alt={data.title || 'product'}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
                            }}
                        />
                    </div>
                    <div 
                        className="wishlist-icon-container" 
                        onClick={(e) => { e.stopPropagation(); handleWishlist(data); }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 10,
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                         <i className={wishlistItem.some((item: any) => item.id === data.id) ? "ri-heart-fill text-danger" : "ri-heart-line"} style={{ fontSize: '18px' }}></i>
                    </div>
                    
                </div>
                <div className="bb-pro-contact">
                    <h4 className="bb-pro-title"><a onClick={handleProductClick} style={{ cursor: 'pointer' }}>{data.title}</a></h4>
                    <div className="product-meta-row">
                        <span className="meta-badge meta-category">{data.category}</span>
                        <span className="meta-badge meta-weight">{data.weight}</span>
                        <div className="meta-badge meta-rating">
                            <i className="ri-star-fill"></i> {data.rating || 4.83}
                            <span className="meta-separator">|</span>
                            <i className="ri-verified-badge-fill verified-icon"></i>
                            <span className="review-count">{data.reviews || 851}</span>
                        </div>
                    </div>
                    
                    <div className="bb-price">
                        <div className="inner-price">
                            <span className="new-price">₹{data.newPrice}</span>
                            <span className={data.oldPrice && data.oldPrice > 0 ? "old-price" : "item-left"}>
                                {data.oldPrice && data.oldPrice > 0 ? (typeof data.oldPrice === 'number' ? `₹${data.oldPrice.toFixed(2)}` : data.oldPrice) : ""}
                            </span>
                        </div>
                    </div>
                    <div className="bb-add-to-cart-btn" style={{ marginTop: '12px' }}>
                        <button 
                            className="add-to-cart-btn-custom"
                            onClick={(e) => { e.stopPropagation(); handleCart(data); }}
                            disabled={isAddingToCart}
                        >
                            {isAddingToCart ? (
                                "Adding..."
                            ) : (
                                <>
                                    <img 
                                        src="/assets/img/logo/ThandattiPatti.png" 
                                        alt="logo" 
                                    />
                                    Add to cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <ItemModal data={data} isModalOpen={isModalOpen} closeItemModal={closeItemModal} />
        </>
    )
}

export default ProductItemCard
