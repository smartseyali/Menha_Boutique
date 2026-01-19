import React, { useState, useEffect } from 'react'
import SingleProductSlider from './single-product-slider/SingleProductSlider'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productApi, mapProductToFrontend, reviewApi } from '@/utils/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addItemToCart, updateCartItemQuantity } from '@/utils/cartOperations';
import { setCartOpen } from '@/store/reducer/cartSlice';
import { showSuccessToast, showErrorToast } from '@/components/toast-popup/Toastify';
import { addWishlist } from '@/store/reducer/wishlistSlice';


const ProductsDetails = ({ productId }: { productId?: string }) => {
    const dispatch = useDispatch();
    const cartSlice = useSelector((state: RootState) => state.cart?.items);
    const wishlistItem = useSelector((state: RootState) => state.wishlist?.wishlist);
    const [activeIndex, setActiveIndex] = useState<number>(0);


    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState<any>(null);
    const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [selectedOldPrice, setSelectedOldPrice] = useState<number | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewCount, setReviewCount] = useState<number>(0);

    const fetchProductAndReviews = async () => {
        if (productId) {
            try {
                // Fetch product data
                const productData = await productApi.getById(productId);
                if (productData) {
                    const mappedProduct = mapProductToFrontend(productData, productData.images || []);
                    
                    // Debug: Log product data to check if details/information are present
                    console.log('Product Data:', {
                        rating: mappedProduct?.rating,
                        detailedDescription: mappedProduct?.detailedDescription || (mappedProduct as any)?.detailed_description,
                        description: mappedProduct?.description,
                        reviews: mappedProduct?.reviews?.length || 0,
                        productDetails: mappedProduct?.productDetails,
                        productInformation: mappedProduct?.productInformation,
                        hasProductDetails: !!(mappedProduct?.productDetails || (mappedProduct as any)?.product_details),
                        hasProductInformation: !!(mappedProduct?.productInformation || (mappedProduct as any)?.product_information),
                    });
                    
                    setProduct(mappedProduct);
                    
                    // Set default attribute if available
                    if (mappedProduct?.attributes && mappedProduct.attributes.length > 0) {
                        const defaultIndex = mappedProduct.attributes.findIndex((attr: any) => attr.isDefault);
                        const selectedIndex = defaultIndex >= 0 ? defaultIndex : 0;
                        setActiveIndex(selectedIndex);
                        const defaultAttr = mappedProduct.attributes[selectedIndex];
                        setSelectedAttribute(defaultAttr);
                        setSelectedPrice(defaultAttr.price);
                        setSelectedOldPrice(defaultAttr.oldPrice);
                    } else {
                        // Use product price if no attributes
                        setSelectedPrice(mappedProduct?.newPrice || 0);
                        setSelectedOldPrice(mappedProduct?.oldPrice || null);
                        setActiveIndex(0);
                    }
                }
                
                // Fetch reviews from database
                try {
                    const reviewsData = await reviewApi.getByProductId(productId);
                    if (reviewsData && Array.isArray(reviewsData)) {
                        setReviews(reviewsData);
                        setReviewCount(reviewsData.length);
                    } else {
                        setReviews([]);
                        setReviewCount(0);
                    }
                } catch (reviewError) {
                    console.error('Error fetching reviews:', reviewError);
                    setReviews([]);
                    setReviewCount(0);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            }
        }
    };

    useEffect(() => {
        fetchProductAndReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    // Listen for review creation events to refresh product data
    useEffect(() => {
        const handleReviewCreated = (event: CustomEvent) => {
            if (event.detail?.productId === productId) {
                console.log('Review created event received, refreshing product data...');
                // Refresh product data and reviews after a short delay to ensure backend has updated
                setTimeout(() => {
                    fetchProductAndReviews();
                }, 500);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('reviewCreated', handleReviewCreated as EventListener);
            return () => {
                window.removeEventListener('reviewCreated', handleReviewCreated as EventListener);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const router = useRouter();

    const handleBuyNow = async () => {
        if (!product) return;
        
        try {
            const productToAdd = {
                ...product,
                // Ensure we use the selected attribute details if available
                newPrice: selectedPrice || product.newPrice,
                oldPrice: selectedOldPrice || product.oldPrice,
            };

            const existingItem = cartSlice?.find((item: any) => item.productId === product.id || item.id === product.id);

            if (!existingItem) {
                await addItemToCart(dispatch, productToAdd, quantity);
            } else {
                // If item exists, update quantity
                if (existingItem.cartItemId) {
                    const newQuantity = existingItem.quantity + quantity;
                    await updateCartItemQuantity(dispatch, existingItem.cartItemId, newQuantity);
                } else {
                    // Fallback if cartItemId is missing
                    await addItemToCart(dispatch, productToAdd, quantity);
                }
            }
            router.push('/checkout');
        } catch (error: any) {
            console.error('Error adding to cart for buy now:', error);
            showErrorToast(error.message || "Failed to process buy now.");
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        
        try {
            const productToAdd = {
                ...product,
                // Ensure we use the selected attribute details if available
                newPrice: selectedPrice || product.newPrice,
                oldPrice: selectedOldPrice || product.oldPrice,
            };

            const existingItem = cartSlice?.find((item: any) => item.productId === product.id || item.id === product.id);

            if (!existingItem) {
                await addItemToCart(dispatch, productToAdd, quantity);
                showSuccessToast("Item added to cart");
            } else {
                // If item exists, update quantity
                if (existingItem.cartItemId) {
                    const newQuantity = existingItem.quantity + quantity;
                    await updateCartItemQuantity(dispatch, existingItem.cartItemId, newQuantity);
                    showSuccessToast("Item quantity updated in cart");
                } else {
                    // Fallback if cartItemId is missing (shouldn't happen with correct API sync)
                    await addItemToCart(dispatch, productToAdd, quantity);
                    showSuccessToast("Item added to cart");
                }
            }
            dispatch(setCartOpen(true));
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            showErrorToast(error.message || "Failed to add item to cart.");
        }
    };

    const handleAddToWishlist = () => {
        if (!product) return;
        const isItemInWishlist = wishlistItem.some(
            (item: any) => item.id === product.id
        );
        if (!isItemInWishlist) {
            dispatch(addWishlist(product));
            showSuccessToast("Item added to wishlist");
        } else {
            showErrorToast("Item already in wishlist");
        }
    };



    const handleActiveTab = (index: any) => {
        setActiveIndex(index);
        // Update selected attribute and price when user selects a weight
        if (product?.attributes && product.attributes[index]) {
            const attr = product.attributes[index];
            setSelectedAttribute(attr);
            setSelectedPrice(attr.price);
            setSelectedOldPrice(attr.oldPrice);
        }
    }

    const handleIncrement = () => {
        setQuantity(prevQty => prevQty + 1);
    };

    const handleDecrement = () => {
        setQuantity(prevQty => (prevQty > 1 ? prevQty - 1 : 1));
    };

    // Calculate discount and format price based on selected attribute
    const getPriceDisplay = () => {
        if (!product) return { price: "₹0.00", discount: "", mrp: "" };
        
        const newPrice = selectedPrice > 0 ? `₹${selectedPrice.toFixed(2)}` : (product.newPrice ? `₹${product.newPrice.toFixed(2)}` : "₹0.00");
        let discount = "";
        let mrp = "";
        
        const oldPriceNum = selectedOldPrice || product.oldPrice;
        const newPriceNum = selectedPrice || product.newPrice || 0;
        
        if (oldPriceNum && oldPriceNum > 0 && newPriceNum > 0 && oldPriceNum > newPriceNum) {
            mrp = `₹${oldPriceNum.toFixed(2)}`;
        }
        
        return { price: newPrice, discount, mrp };
    };

    const priceDisplay = getPriceDisplay();
    const displayTitle = product?.title || "";
    const displaySKU = product?.sku || "";
    const displayStatus = product?.status || "In stock";
    // Use detailed description from database, fallback to regular description
    const displayDescription = product?.detailedDescription || product?.detailed_description || product?.description || '';
    
    // Calculate rating from database (average of reviews or product rating field)
    // Rating is calculated from approved reviews and stored in product.rating field
    const calculateRating = () => {
        // First, try to get rating from product.rating field (calculated from reviews)
        if (product?.rating !== undefined && product?.rating !== null && product.rating > 0) {
            return parseFloat(product.rating) || 0;
        }
        
        // Calculate from fetched reviews (approved reviews from database)
        if (reviews && Array.isArray(reviews) && reviews.length > 0) {
            const validReviews = reviews.filter((r: any) => {
                const rating = parseInt(r.rating) || 0;
                return rating > 0 && rating <= 5;
            });
            if (validReviews.length > 0) {
                const sum = validReviews.reduce((acc: number, review: any) => {
                    return acc + (parseInt(review.rating) || 0);
                }, 0);
                const avgRating = sum / validReviews.length;
                return Math.round(avgRating * 10) / 10; // Round to 1 decimal place
            }
        }
        
        // Fallback to product.reviews if available
        if (product?.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
            const approvedReviews = product.reviews.filter((r: any) => r.is_approved !== false);
            if (approvedReviews.length > 0) {
                const sum = approvedReviews.reduce((acc: number, review: any) => acc + (parseInt(review.rating) || 0), 0);
                const avgRating = sum / approvedReviews.length;
                return Math.round(avgRating * 10) / 10; // Round to 1 decimal place
            }
        }
        
        // Return 0 if no rating available
        return 0;
    };
    
    const productRating = calculateRating();
    
    // Calculate rating stars (0-5 rating) from database
    const renderStars = () => {
        const rating = productRating;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        // If no rating, show empty stars
        if (rating === 0) {
            return (
                <>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <i key={`empty-${i}`} className="ri-star-line"></i>
                    ))}
                </>
            );
        }
        
        return (
            <>
                {Array.from({ length: fullStars }).map((_, i) => (
                    <i key={`full-${i}`} className="ri-star-fill"></i>
                ))}
                {hasHalfStar && <i className="ri-star-half-fill"></i>}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <i key={`empty-${i}`} className="ri-star-line"></i>
                ))}
            </>
        );
    };

    return (
        <>
            <div className="bb-single-pro">
                <Row>
                    <Col sm={12} lg={5} className="col-12 mb-24">
                        <SingleProductSlider productId={productId} />
                    </Col>
                    <Col lg={7} className="col-12 mb-24">
                        <div className="bb-single-pro-contact">
                            <div className="bb-sub-title">
                                <h4>{displayTitle}</h4>
                            </div>
                            <div className="bb-single-rating">
                                <span className="bb-pro-rating">
                                    {renderStars()}
                                </span>
                                {(reviewCount > 0 || (product?.reviews && product.reviews.length > 0)) && (
                                    <span className="bb-read-review">
                                        |&nbsp;&nbsp;<Link href="#reviews">{(reviewCount || product?.reviews?.length || 0)} {(reviewCount || product?.reviews?.length || 0) === 1 ? 'Review' : 'Reviews'}</Link>
                                    </span>
                                )}
                            </div>
                            {/* Detailed Description below rating (from database) */}
                            {displayDescription && (
                                <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                                    {displayDescription.includes('•') ? (
                                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                            {displayDescription.split('•').filter((item: string) => item.trim()).map((item: string, index: number) => (
                                                <li key={index} style={{ marginBottom: '5px' }}>{item.trim()}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        displayDescription.split('\n').map((item: string, index: number) => (
                                            <p key={index} style={{ marginBottom: '5px' }}>{item}</p>
                                        ))
                                    )}
                                </div>
                            )}
                            <div className="bb-single-price-wrap">
                                <div className="bb-single-price">
                                    <div className="price">
                                        <h5>{priceDisplay.price}</h5>
                                    </div>
                                    {priceDisplay.mrp && (
                                        <div className="mrp">
                                            <p>M.R.P. : <span>{priceDisplay.mrp}</span></p>
                                        </div>
                                    )}
                                </div>
                                <div className="bb-single-price">
                                    <div className="sku">
                                        <h5>SKU#: {displaySKU}</h5>
                                    </div>
                                    <div className="stock">
                                        <span>{displayStatus}</span>
                                    </div>
                                </div>
                            </div>
                            {product?.attributes && product.attributes.length > 0 && (
                                <div className="bb-single-pro-weight">
                                    <div className="pro-title">
                                        <h4>Weight / Size</h4>
                                    </div>
                                    <div className="bb-pro-variation-contant">
                                        <ul>
                                            {product.attributes.map((attr: any, index: number) => (
                                                <li 
                                                    key={attr.id || index} 
                                                    onClick={() => handleActiveTab(index)} 
                                                    className={activeIndex === index ? "active-variation" : ""}
                                                >
                                                    <span>{attr.attributeValue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="bb-single-qty">
                                <div className="qty-plus-minus">
                                    <div
                                        onClick={handleDecrement}
                                        className='bb-qtybtn'
                                        style={{ margin: " 0 0 0 10px" }}
                                    >
                                        -
                                    </div>
                                    <input
                                        readOnly
                                        className="qty-input location-select"
                                        type="text"
                                        name="gi-qtybtn"
                                        value={quantity}
                                    />
                                    <div onClick={handleIncrement} className='bb-qtybtn'
                                        style={{ margin: " 0 10px 0 0" }}
                                    >
                                        +
                                    </div>
                                </div>
                                <div className="buttons">
                                    <button onClick={handleAddToCart} className="bb-btn-2">Add to Cart</button>
                                    <button onClick={handleBuyNow} className="bb-btn-2" style={{ marginLeft: '10px', backgroundColor: '#333', borderColor: '#333' }}>Buy Now</button>
                                </div>
                                <ul className="bb-pro-actions">
                                    <li className="bb-btn-group">
                                        <a onClick={(e) => { e.preventDefault(); handleAddToWishlist(); }} href="#" title="Wishlist">
                                            <i className="ri-heart-line"></i>
                                        </a>
                                    </li>

                                </ul>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

        </>
    )
}

export default ProductsDetails
