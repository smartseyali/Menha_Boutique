"use client"
import { getUserData } from '@/utils/userData'
import { RootState } from '@/store'
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { Col, Form, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const BlogDetails = () => {
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const user = useSelector((state: RootState) => state.login.user);
    const [validated, setValidated] = useState(false)
    const [userData, setUserData] = useState<any | null>(null);
    const [comment, setComment] = useState([
        {
            name: "Mariya",
            lastName: "Lykra",
            email: "test111@gmail.com",
            comment: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nemo, et? Quam eius facere optio explicabo consequatur aut ad. Magnam, aspernatur!",
            date: " 14/03/2020",
            profilePhoto: "",
            replies: [],
        }
    ])
    const [newComment, setNewComment] = useState({
        comment: "",
    })
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [newReply, setNewReply] = useState({
        reply: "",
    });

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

    const handleCommentChange = (e: any) => {
        const { name, value } = e.target
        setNewComment((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNewReplyChange = (e: any) => {
        const { name, value } = e.target
        setNewReply((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement;
        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            const date = new Date().toLocaleDateString()
            setComment((prevComment) => [
                ...prevComment,
                {
                    ...newComment,
                    date,
                    profilePhoto: userData?.profilePhoto,
                    name: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    replies: []
                },
            ])
            setNewComment({ comment: "" })
        }
        setValidated(true)
    }

    const handleReplySubmit = (e: React.FormEvent, index: number) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            const date = new Date().toLocaleDateString();
            setComment((prevComments: any) => {
                const updatedComments = [...prevComments]
                updatedComments[index] = {
                    ...updatedComments[index],
                    replies: [
                        ...updatedComments[index].replies,
                        {
                            ...newReply,
                            date,
                            profilePhoto: userData.profilePhoto,
                            name: userData.firstName,
                            lastName: userData.lastName,
                            email: userData.email
                        }
                    ]

                }
                return updatedComments;
            })
            setNewReply({ reply: "" })
            setReplyingTo(null)
        }

        setValidated(true)

    };

    const handleReplyClick = (index: number) => {
        setReplyingTo(index);
    };

    return (
        <Fade triggerOnce direction='up' duration={1000} delay={400} className="bb-blog-details-contact">
            <div className="inner-blog-details-image">
                <img src="/assets/img/blog-details/one.jpg" alt="details-one" />
            </div>
            <div className="inner-blog-details-contact">
                <span>May 30,2022</span>
                <h4 className="sub-title">Marketing Guide: 5 Steps to Success.</h4>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis inventore fuga at
                    iure voluptate, laudantium commodi officiis provident facere quis quae, laboriosam
                    ducimus nihil molestiae vel beatae numquam assumenda dicta modi. Mollitia soluta ipsa
                    cum pariatur! Obcaecati similique amet fuga minima vitae corporis odio eius tenetur
                    repudiandae quaerat maiores quo officia, sunt, ab omnis id soluta explicabo quas? Quasi
                    nam, inventore voluptas tempore ex modi consequuntur reiciendis enim, molestias labore
                    neque! A nostrum necessitatibus dolorem sequi earum inventore labore error.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam harum inventore, ipsa
                    velit, laudantium perspiciatis exercitationem veritatis, molestiae magnam voluptatibus
                    suscipit accusamus fuga veniam laborum cumque vitae cum? Cumque, aliquid.</p>
                <Row>
                    <Col lg={6}>
                        <div className="blog-inner-image">
                            <img src="/assets/img/blog/1.jpg" alt="blog-1" />
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div className="blog-inner-image">
                            <img src="/assets/img/blog/2.jpg" alt="blog-2" />
                        </div>
                    </Col>
                </Row>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis inventore fuga at
                    ducimus nihil molestiae vel beatae numquam assumenda dicta modi. Mollitia soluta ipsa
                    repudiandae quaerat maiores quo officia, sunt, ab omnis id soluta explicabo quas? Quasi
                    nam, inventore voluptas tempore ex modi consequuntur reiciendis enim, molestias labore
                    neque! A nostrum necessitatibus dolorem sequi earum inventore labore error.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam harum inventore, ipsa
                    suscipit accusamus fuga veniam laborum cumque vitae cum? Cumque, aliquid.</p>
            </div>
            {!isAuthenticated ? (
                <div className="container">
                    <p>
                        Please <a style={{ color: "blue" }} href="/login">login</a> or{" "}
                        <a style={{ color: "blue" }} href="/register">register</a> to review the blog comments.
                    </p>
                </div>
            ) : (
                <div>
                    <div className="bb-blog-details-comment">
                        <div className="main-title">
                            <h4>Comments {comment.length}</h4>
                        </div>
                        {comment.map((data, index) => (
                            <div key={index}>
                                <div className="bb-comment-box">
                                    <div className="inner-image">
                                        <img src={data.profilePhoto || "/assets/img/user-photo/placeholder.jpg"} alt="reviews-1" />
                                    </div>
                                    <div className="inner-contact">
                                        <h5 className="sub-title">{data.name} {data.lastName}</h5>
                                        <span>{data.date}</span>
                                        <p>{data.comment}</p>
                                        <a onClick={() => handleReplyClick(index)} className="bb-details-btn">Reply <i className="ri-arrow-right-line"></i></a>
                                        {replyingTo === index && (
                                            <Form onSubmit={(e) => handleReplySubmit(e, index)} noValidate validated={validated} method="post">
                                                <Row>
                                                    <Col sm={12}>
                                                        <div className="bb-details-input">
                                                            <Form.Group>
                                                                <Form.Control onChange={handleNewReplyChange} value={newReply.reply} name="reply" type='text' placeholder="Message" required></Form.Control>
                                                                <Form.Control.Feedback type="invalid">
                                                                    Please Enter Message.
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </div>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <div className="bb-details-buttons">
                                                            <button type='submit' className="bb-btn-2">Submit</button>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        )}
                                    </div>
                                </div>
                                {data.replies.map((reply: any, index) => (
                                    <div key={index} className="bb-comment-box bb-pl-50">
                                        <div className="inner-image">
                                            <img src={reply.profilePhoto || "/assets/img/user-photo/placeholder.jpg"} alt="reviews-1" />
                                        </div>
                                        <div className="inner-contact">
                                            <h5 className="sub-title">{reply.name} {reply.lastName}</h5>
                                            <span>{reply.date}</span>
                                            <p>{reply.reply}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="bb-blog-details-comment">
                        <div className="main-title">
                            <h4>Leave A Reply</h4>
                        </div>
                        <Form validated={validated} noValidate onSubmit={handleSubmit} method="post">
                            <Row>
                                <Col sm={12}>
                                    <div className="bb-details-input">
                                        <Form.Group>
                                            <Form.Control onChange={handleCommentChange} value={newComment.comment} as='textarea' name='comment' placeholder="Message" required></Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                Please Enter Message.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col sm={12}>
                                    <div className="bb-details-buttons">
                                        <button type='submit' className="bb-btn-2">Submit</button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
            )}
        </Fade>
    )
}

export default BlogDetails
