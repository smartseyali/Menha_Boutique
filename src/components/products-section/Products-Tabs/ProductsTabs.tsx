import { getUserData } from '@/utils/userData';
import RatingComponent from '@/components/stars/RatingCompoents';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { reviewApi, productApi, mapProductToFrontend } from '@/utils/api';
import { showSuccessToast, showErrorToast } from '@/components/toast-popup/Toastify';
import Link from 'next/link';

const ProductsTabs = ({ productId, onReviewCreated }: { productId?: string; onReviewCreated?: () => void }) => {
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const user = useSelector((state: RootState) => state.login.user);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [validated, setValidated] = useState(false);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [userData, setUserData] = useState<any | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated) {
            // Use Redux user data first, then fallback to getUserData
            if (user) {
                setUserData(user);
            } else {
                const data = getUserData();
                if (data) {
                    setUserData(data);
                }
            }
        }
    }, [isAuthenticated, user]);

    // Fetch product details and reviews
    useEffect(() => {
        const fetchProductAndReviews = async () => {
            if (productId) {
                try {
                    setLoadingReviews(true);
                    // Fetch product details
                    const productData = await productApi.getById(productId);
                    if (productData) {
                        // Map product to frontend format to ensure consistent structure
                        const mappedProduct = mapProductToFrontend(productData, productData.images || []);
                        setProduct(mappedProduct || productData);
                    }
                    // Fetch reviews (works for guest users - no authentication required)
                    try {
                        const reviewsData = await reviewApi.getByProductId(productId);
                        console.log('Fetched reviews data:', reviewsData);
                        if (reviewsData && Array.isArray(reviewsData)) {
                            const mappedReviews = reviewsData.map((review: any) => ({
                                id: review.id,
                                name: `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Anonymous',
                                rating: review.rating || 0,
                                comment: review.comment || '',
                                avatar: review.profile_photo || review.avatar_url || "/assets/img/user-photo/placeholder.jpg",
                                createdAt: review.created_at || review.createdAt,
                                // Keep original data for reference
                                first_name: review.first_name,
                                last_name: review.last_name,
                                profile_photo: review.profile_photo,
                                avatar_url: review.avatar_url,
                            }));
                            console.log('Mapped reviews:', mappedReviews);
                            setReviews(mappedReviews);
                        } else {
                            console.log('No reviews data or invalid format');
                            setReviews([]);
                        }
                    } catch (reviewError) {
                        console.error('Error fetching reviews:', reviewError);
                        setReviews([]);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                } finally {
                    setLoadingReviews(false);
                }
            }
        };

        fetchProductAndReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        if (!productId) {
            showErrorToast('Product ID is required');
            return;
        }

        if (!userData || !comment || !rating) {
            showErrorToast('Please fill in all fields');
            setValidated(true);
            return;
        }

        try {
            // Submit review to backend
            const newReview = await reviewApi.create(productId, rating, comment);
            console.log('Review created successfully:', newReview);
            
            // Wait a bit to ensure database transaction is committed
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Refetch reviews from API to get the complete review with user information
            try {
                const reviewsData = await reviewApi.getByProductId(productId);
                console.log('Refetched reviews after creation:', reviewsData);
                console.log('Number of reviews fetched:', reviewsData?.length || 0);
                
                if (reviewsData && Array.isArray(reviewsData)) {
                    const mappedReviews = reviewsData.map((review: any) => {
                        console.log('Mapping review:', review.id, review.is_approved, review.first_name, review.last_name);
                        return {
                            id: review.id,
                            name: `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Anonymous',
                            rating: parseInt(review.rating) || 0,
                            comment: review.comment || '',
                            avatar: review.profile_photo || review.avatar_url || "/assets/img/user-photo/placeholder.jpg",
                            createdAt: review.created_at || review.createdAt,
                            // Keep original data for reference
                            first_name: review.first_name,
                            last_name: review.last_name,
                            profile_photo: review.profile_photo,
                            avatar_url: review.avatar_url,
                            is_approved: review.is_approved,
                        };
                    });
                    console.log('Mapped reviews count:', mappedReviews.length);
                    
                    // Always ensure the new review is in the list (add it if missing)
                    const newReviewInList = mappedReviews.find((r: any) => r.id === newReview.id);
                    if (!newReviewInList && newReview.id) {
                        console.log('New review not found in refetched list. Adding manually...', newReview);
                        // Add the new review manually if it's not in the refetched list
                        const reviewName = (newReview.first_name && newReview.last_name) 
                            ? `${newReview.first_name} ${newReview.last_name}`.trim()
                            : (userData?.firstName || userData?.first_name) && (userData?.lastName || userData?.last_name)
                            ? `${userData.firstName || userData.first_name} ${userData.lastName || userData.last_name}`.trim()
                            : 'You';
                        
                        const newReviewItem = {
                            id: newReview.id,
                            name: reviewName,
                            rating: parseInt(newReview.rating) || rating,
                            comment: newReview.comment || comment,
                            avatar: newReview.profile_photo || newReview.avatar_url || userData?.profilePhoto || userData?.profile_photo || "/assets/img/user-photo/placeholder.jpg",
                            createdAt: newReview.created_at || newReview.createdAt || new Date().toISOString(),
                            first_name: newReview.first_name || userData?.firstName || userData?.first_name || '',
                            last_name: newReview.last_name || userData?.lastName || userData?.last_name || '',
                            profile_photo: newReview.profile_photo || userData?.profilePhoto || userData?.profile_photo || '',
                            avatar_url: newReview.avatar_url || '',
                            is_approved: newReview.is_approved !== false,
                        };
                        
                        // Add new review at the beginning of the list (most recent first)
                        setReviews([newReviewItem, ...mappedReviews]);
                        console.log('Added new review manually. Total reviews:', [newReviewItem, ...mappedReviews].length);
                    } else {
                        // Review is already in the list, just set it
                        setReviews(mappedReviews);
                        console.log('Review found in refetched list. Total reviews:', mappedReviews.length);
                    }
        } else {
                    console.warn('No reviews data returned or invalid format');
                    // Fallback: add the new review to local state
                    const reviewName = newReview.first_name && newReview.last_name 
                        ? `${newReview.first_name} ${newReview.last_name}`.trim()
                        : `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'You';
                    setReviews([
                        {
                            id: newReview.id,
                            name: reviewName,
                            rating: parseInt(newReview.rating) || rating,
                            comment: newReview.comment || comment,
                            avatar: newReview.profile_photo || newReview.avatar_url || userData.profilePhoto || "/assets/img/user-photo/placeholder.jpg",
                            createdAt: newReview.created_at || new Date().toISOString(),
                            first_name: newReview.first_name,
                            last_name: newReview.last_name,
                            profile_photo: newReview.profile_photo,
                            avatar_url: newReview.avatar_url,
                            is_approved: newReview.is_approved !== false,
                        },
                        ...reviews,
                    ]);
                }
            } catch (refetchError) {
                console.error('Error refetching reviews:', refetchError);
                // If refetch fails, add the new review to local state as fallback
                const reviewName = newReview.first_name && newReview.last_name 
                    ? `${newReview.first_name} ${newReview.last_name}`.trim()
                    : `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'You';
                setReviews([
                    {
                        id: newReview.id,
                        name: reviewName,
                        rating: parseInt(newReview.rating) || rating,
                        comment: newReview.comment || comment,
                        avatar: newReview.profile_photo || newReview.avatar_url || userData.profilePhoto || "/assets/img/user-photo/placeholder.jpg",
                        createdAt: newReview.created_at || new Date().toISOString(),
                        first_name: newReview.first_name,
                        last_name: newReview.last_name,
                        profile_photo: newReview.profile_photo,
                        avatar_url: newReview.avatar_url,
                        is_approved: newReview.is_approved !== false,
                    },
                    ...reviews,
                ]);
            }
            
                setComment("");
                setRating(0);
            setValidated(false);
            showSuccessToast('Review submitted successfully!');
            
            // Notify parent component to refresh product data (for review count and rating update)
            if (onReviewCreated) {
                onReviewCreated();
            }
            
            // Also dispatch a custom event for components that might be listening
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('reviewCreated', { detail: { productId } }));
            }
        } catch (error: any) {
            console.error('Error submitting review:', error);
            showErrorToast(error.message || 'Failed to submit review');
            setValidated(true);
        }
    };

    const handleProductClick = (index: number) => {
        setSelectedIndex(index);
    };

    return (
        <>
            <Tabs className="bb-single-pro-tab">
                <TabList className="bb-pro-tab">
                    <ul className="bb-pro-tab-nav nav">
                        <Tab style={{outline : "none"}} className="nav-item" key={"detail"}>
                            <a onClick={() => handleProductClick(0)} className={`nav-link  ${selectedIndex === 0 ? "active" : ""}`} data-bs-toggle="tab" href="#detail">Detail</a>
                        </Tab>
                        <Tab style={{outline : "none"}} className="nav-item" key={"information"}>
                            <a onClick={() => handleProductClick(1)} className={`nav-link  ${selectedIndex === 1 ? "active" : ""}`} data-bs-toggle="tab" href="#information">information</a>
                        </Tab>
                        <Tab style={{outline : "none"}} className="nav-item" key={"reviews"}>
                            <a onClick={() => handleProductClick(2)} className={`nav-link  ${selectedIndex === 2 ? "active" : ""}`} data-bs-toggle="tab" href="#reviews">Reviews ({reviews.length})</a>
                        </Tab>
                    </ul>
                </TabList>
                <div className="tab-content">
                    <TabPanel className={`tab-pane fade ${selectedIndex == 0 ? "show active" : ""}`} id="detail">
                        <div className="bb-inner-tabs">
                            <div className="bb-details">
                                <div>
                                    {(() => {
                                        const desc = product?.detailedDescription || product?.detailed_description || product?.description || "No detailed description available for this product.";
                                        if (desc && desc.includes('•')) {
                                            return (
                                                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                                                    {desc.split('•').filter((item: string) => item.trim()).map((item: string, index: number) => (
                                                        <li key={index} style={{ marginBottom: '8px' }}>{item.trim()}</li>
                                                    ))}
                                                </ul>
                                            );
                                        }
                                        return desc.split('\n').map((item: string, index: number) => (
                                            <p key={index} style={{ marginBottom: '10px' }}>{item}</p>
                                        ));
                                    })()}
                                </div>
                                {(() => {
                                    const productDetails = product?.productDetails || product?.product_details;
                                    if (!productDetails) return null;
                                    
                                    // Check if it's a valid non-empty object or string
                                    let detailsEntries: [string, any][] = [];
                                    if (typeof productDetails === 'object' && productDetails !== null && !Array.isArray(productDetails)) {
                                        detailsEntries = Object.entries(productDetails);
                                    } else if (typeof productDetails === 'string' && productDetails.trim() !== '') {
                                        try {
                                            const parsed = JSON.parse(productDetails);
                                            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                                detailsEntries = Object.entries(parsed);
                                            }
                                        } catch (e) {
                                            console.error('Error parsing product details:', e);
                                            return null;
                                        }
                                    }
                                    
                                    // Only render if we have entries
                                    if (detailsEntries.length === 0) return null;
                                    
                                    return (
                                        <div className="details-info" style={{ marginTop: '20px' }}>
                                            <h5 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>Product Details</h5>
                                            <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                                {detailsEntries.map(([key, value]: [string, any]) => (
                                                    <li key={key} style={{ marginBottom: '8px' }}>
                                                        <strong>{key}:</strong> {String(value || 'N/A')}
                                                    </li>
                                                ))}
                                    </ul>
                                </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel className={`tab-pane fade ${selectedIndex == 1 ? "show active" : ""}`} id="information">
                        <div className="bb-inner-tabs">
                            <div className="information">
                                {(() => {
                                    const productInformation = product?.productInformation || product?.product_information;
                                    if (!productInformation) {
                                        // Fallback to basic product info if no product_information is available
                                        return (
                                            <ul>
                                                <li><span>Weight</span> {product?.weight || 'N/A'}</li>
                                                <li><span>Brand</span> {product?.brand || 'N/A'}</li>
                                                <li><span>SKU</span> {product?.sku || 'N/A'}</li>
                                                <li><span>Status</span> {product?.status || 'N/A'}</li>
                                                {product?.attributes && product.attributes.length > 0 && (
                                                    <>
                                                        <li><span>Available Weights</span> {product.attributes.map((attr: any) => attr.attributeValue).join(', ')}</li>
                                                    </>
                                                )}
                                            </ul>
                                        );
                                    }
                                    
                                    // Check if it's a valid non-empty object or string
                                    let informationEntries: [string, any][] = [];
                                    if (typeof productInformation === 'object' && productInformation !== null && !Array.isArray(productInformation)) {
                                        informationEntries = Object.entries(productInformation);
                                    } else if (typeof productInformation === 'string' && productInformation.trim() !== '') {
                                        try {
                                            const parsed = JSON.parse(productInformation);
                                            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                                                informationEntries = Object.entries(parsed);
                                            }
                                        } catch (e) {
                                            console.error('Error parsing product information:', e);
                                            return (
                                                <ul>
                                                    <li><span>Weight</span> {product?.weight || 'N/A'}</li>
                                                    <li><span>Brand</span> {product?.brand || 'N/A'}</li>
                                                    <li><span>SKU</span> {product?.sku || 'N/A'}</li>
                                                    <li><span>Status</span> {product?.status || 'N/A'}</li>
                                                </ul>
                                            );
                                        }
                                    }
                                    
                                    // Only render if we have entries
                                    if (informationEntries.length === 0) {
                                        return (
                                            <ul>
                                                <li><span>Weight</span> {product?.weight || 'N/A'}</li>
                                                <li><span>Brand</span> {product?.brand || 'N/A'}</li>
                                                <li><span>SKU</span> {product?.sku || 'N/A'}</li>
                                                <li><span>Status</span> {product?.status || 'N/A'}</li>
                                            </ul>
                                        );
                                    }
                                    
                                    return (
                                        <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                            {informationEntries.map(([key, value]: [string, any]) => (
                                                <li key={key} style={{ marginBottom: '8px' }}>
                                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</strong> {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
                                                </li>
                                            ))}
                                </ul>
                                    );
                                })()}
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel className={`tab-pane fade ${selectedIndex == 2 ? "show active" : ""}`} id="reviews">
                        <div className="bb-inner-tabs">
                            {/* Reviews List - Visible to all users (guest and authenticated) */}
                            <div className="bb-reviews">
                                {loadingReviews ? (
                                    <p>Loading reviews...</p>
                                ) : reviews.length === 0 ? (
                                    <p>No reviews yet. {isAuthenticated ? 'Be the first to review this product!' : 'Login to be the first to review this product!'}</p>
                                ) : (
                                    (() => {
                                        console.log('Rendering reviews. Total count:', reviews.length);
                                        console.log('Reviews data:', reviews);
                                        return reviews.map((review, index) => {
                                            // Ensure we have all the necessary review data from database
                                            const reviewName = review.name || 
                                                `${review.first_name || ''} ${review.last_name || ''}`.trim() || 
                                                'Anonymous';
                                            const reviewRating = parseInt(review.rating) || 0;
                                            const reviewComment = review.comment || '';
                                            const reviewAvatar = review.avatar || 
                                                review.profile_photo || 
                                                review.avatar_url || 
                                                '/assets/img/user-photo/placeholder.jpg';
                                            const reviewDate = review.createdAt || review.created_at;
                                            const reviewId = review.id || review.review_id || `review-${index}`;
                                            
                                            console.log(`Rendering review ${index + 1}:`, {
                                                id: reviewId,
                                                name: reviewName,
                                                rating: reviewRating,
                                                comment: reviewComment,
                                                is_approved: review.is_approved,
                                            });
                                            
                                            // Only render approved reviews (or all if is_approved is not set)
                                            if (review.is_approved === false) {
                                                console.log('Skipping unapproved review:', reviewId);
                                                return null;
                                            }
                                            
                                            return (
                                                <div key={reviewId} className="reviews-bb-box">
                                                    <div className="inner-image">
                                                        <img 
                                                            src={reviewAvatar} 
                                                            alt={reviewName}
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/assets/img/user-photo/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="inner-contact">
                                                        <h4>{reviewName}</h4>
                                                        <div className="bb-pro-rating">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i
                                                                    key={i}
                                                                    className={`ri-star-${i < reviewRating ? "fill" : "line"}`}
                                                                ></i>
                                                            ))}
                                                        </div>
                                                        <p>{reviewComment}</p>
                                                        {reviewDate && (
                                                            <small style={{ color: '#666', fontSize: '0.9em' }}>
                                                                {new Date(reviewDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }).filter(Boolean); // Remove any null entries
                                    })()
                                )}
                            </div>
                            
                            {/* Review Form - Only visible to authenticated users */}
                            {isAuthenticated ? (
                                    <div className="bb-reviews-form">
                                        <h3>Add a Review</h3>
                                        <Form noValidate validated={validated} onSubmit={handleSubmit} action="#">
                                            <div className="bb-review-rating">
                                                <RatingComponent value={rating} onChange={setRating} />
                                            </div>
                                            <div className="input-box">
                                                <Form.Group>
                                                    <Form.Control onChange={(e) => setComment(e.target.value)} as='textarea' value={comment} rows={5} name="comment"
                                                        placeholder="Enter Your Comment" required></Form.Control>
                                                    <Form.Control.Feedback type='invalid'>
                                                        Please Enter Comment.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                            <div className="input-button">
                                                <button type='submit' className="bb-btn-2">Submit</button>
                                            </div>
                                        </Form>
                                    </div>
                            ) : (
                                <div className="bb-reviews-form" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                    <h3>Add a Review</h3>
                                    <p>
                                        Please <Link href="/login" style={{ color: "blue", textDecoration: "underline" }}>login</Link> or{" "}
                                        <Link href="/register" style={{ color: "blue", textDecoration: "underline" }}>register</Link> to add a review.
                                    </p>
                                </div>
                        )}
                        </div>
                    </TabPanel>
                </div>
            </Tabs>
        </>
    )
}

export default ProductsTabs
