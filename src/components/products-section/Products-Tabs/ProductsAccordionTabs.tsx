import { getUserData } from '@/utils/userData';
import RatingComponent from '@/components/stars/RatingCompoents';
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const ProductsAccordionTabs = () => {
    const [activeAccordion, setActiveAccordion] = useState(0);
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const user = useSelector((state: RootState) => state.login.user);
    const [validated, setValidated] = useState(false);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [userData, setUserData] = useState<any | null>(null);
    const [reviews, setReviews] = useState([
        {
            name: "Mariya Lykra",
            rating: 5,
            comment: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...",
            avatar: "/assets/img/user-photo/placeholder.jpg",
        },
    ]);

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            if (userData && comment && rating) {
                setReviews([
                    ...reviews,
                    {
                        name: `${userData.firstName} ${userData.lastName}`,
                        rating,
                        comment,
                        avatar: userData.profilePhoto || "/assets/img/user-photo/placeholder.jpg",
                    },
                ]);

                setComment("");
                setRating(0);
            }
        }
        setValidated(true);
    };

    const handleAccordionToggle = (index: any) => {
        setActiveAccordion(index === activeAccordion ? null : index);
    };

    return (
        <>
            <div className="bey-single-accordion">
                <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                        <h2 onClick={() => handleAccordionToggle(0)} className="accordion-header">
                            <button className={`accordion-button ${activeAccordion === 0 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Product Detail
                            </button>
                        </h2>
                        <div id="collapseOne" className={`accordion-collapse collapse  ${activeAccordion === 0 ? "show" : ""}`}
                            data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                <div className="bb-details">
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero,
                                        voluptatum.
                                        Vitae dolores alias repellat eligendi, officiis, exercitationem corporis
                                        quisquam delectus cum non recusandae numquam dignissimos molestiae
                                        magnam
                                        hic natus. Cumque.</p>
                                    <div className="details-info">
                                        <ul>
                                            <li>Any Product types that You want - Simple, Configurable</li>
                                            <li>Downloadable/Digital Products, Virtual Products</li>
                                            <li>Inventory Management with Backordered items</li>
                                            <li>Flatlock seams throughout.</li>
                                        </ul>
                                        <ul>
                                            <li><span>Highlights</span>Form FactorWhole</li>
                                            <li><span>Seller</span>No Returns Allowed</li>
                                            <li><span>Services</span>Cash on Delivery available</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 onClick={() => handleAccordionToggle(1)} className="accordion-header">
                            <button className={`accordion-button ${activeAccordion === 1 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                information
                            </button>
                        </h2>
                        <div id="collapseTwo" className={`accordion-collapse collapse ${activeAccordion === 1 ? "show" : ""}`}
                            data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                <div className="information">
                                    <ul>
                                        <li><span>Weight</span> 500 g</li>
                                        <li><span>Dimensions</span> 17 × 15 × 3 cm</li>
                                        <li><span>Color</span> black,yellow,red</li>
                                        <li><span>Brand</span> Wonder Fort</li>
                                        <li><span>Form Factor</span>Whole</li>
                                        <li><span>Quantity</span>1</li>
                                        <li><span>Container Type</span>Pouch</li>
                                        <li><span>Shelf Life</span>12 Months</li>
                                        <li><span>Ingredients</span>Dalchini, Dhaniya, Badi Elaichi, Laung</li>
                                        <li><span>Other Features</span>Ingredient Type: Vegetarian</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 onClick={() => handleAccordionToggle(2)} className="accordion-header">
                            <button className={`accordion-button ${activeAccordion === 2 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseThree" aria-expanded="false"
                                aria-controls="collapseThree">
                                Reviews
                            </button>
                        </h2>
                        <div id="collapseThree" className={`accordion-collapse collapse ${activeAccordion === 2 ? "show" : ""}`}
                            data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                {!isAuthenticated ? (
                                    <>
                                        <div className="container">
                                            <p>
                                                Please <a style={{ color: "blue" }} href="/login">login</a> or{" "}
                                                <a style={{ color: "blue" }} href="/register">register</a> to review the blog comments.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>

                                        <div className="bb-reviews">
                                            {reviews.map((data, index) => (
                                                <div key={index} className="reviews-bb-box">
                                                    <div className="inner-image">
                                                        <img src={data.avatar || "/assets/img/reviews/1.jpg"} alt="img-1" />
                                                    </div>
                                                    <div className="inner-contact">
                                                        <h4>{data.name}</h4>
                                                        <div className="bb-pro-rating">
                                                            {[...Array(5)].map((_: any, i: any) => (
                                                                <i key={i} className={`ri-star-${i < data.rating ? "fill" : "line"}`}></i>
                                                            ))}
                                                        </div>
                                                        <p>{data.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bb-reviews-form">
                                            <h3>Add a Review</h3>
                                            <Form validated={validated} noValidate onSubmit={handleSubmit} action="#">
                                                <div className="bb-review-rating">
                                                    <div className="bb-pro-rating">
                                                        <RatingComponent value={rating} onChange={setRating} />
                                                    </div>
                                                </div>
                                                <div className="input-box">
                                                    <Form.Group>
                                                        <Form.Control as='textarea' rows={5} name="your-comment" onChange={(e) => setComment(e.target.value)} value={comment}
                                                            placeholder="Enter Your Comment" required></Form.Control>
                                                        <Form.Control.Feedback type='invalid'>
                                                            Please Enter Your Comment
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                </div>
                                                <div className="input-button">
                                                    <button type='submit' className="bb-btn-2">Submit</button>
                                                </div>
                                            </Form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductsAccordionTabs
