import React, { useEffect, useState } from 'react'
import { Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
interface FormValues {
    email: string;
}

const NewsletterModal = () => {
    const [visibleModal, setVisibleModal] = useState(false);

    const schema = yup.object().shape({
        email: yup.string().required(),
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisibleModal(true)
        }, 5000)
        return () => clearTimeout(timer)
    }, []);

    const handleClose = () => {
        setVisibleModal(false)
    }

    const initialValues: FormValues = {
        email: "",
    };

    const handleSubmit = (
        values: FormValues,
        formikHelpers: FormikHelpers<FormValues>
    ) => {
        console.log(values);
        formikHelpers.setSubmitting(false);
    };

    return (
        <>
            <div onClick={handleClose} style={{ display: visibleModal ? "block" : "none" }} className="bb-popnews-bg"></div>
            {visibleModal && (
                <div style={{ display: visibleModal ? "block" : "none" }} className="bb-popnews-box">
                    <div onClick={handleClose} className="bb-popnews-close" title="Close"></div>
                    <Row>
                        <Col md={6} className="col-12">
                            <img src={"/assets/img/newsletter/newsletter.jpg"} alt="newsletter" />
                        </Col>
                        <Col md={6} className="col-12">
                            <div className="bb-popnews-box-content">
                                <h2>Newsletter.</h2>
                                <p>Subscribe to Pattikadai to get in touch and receive future updates.</p>
                                <Formik
                                    validationSchema={schema}
                                    onSubmit={handleSubmit}
                                    initialValues={initialValues}>
                                    {({
                                        handleSubmit,
                                        handleChange,
                                        values,
                                        touched,
                                        errors,
                                    }: any) => {
                                        return (
                                            <Form noValidate onSubmit={handleSubmit} className="bb-popnews-form" action="#" method="post">
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control
                                                            type="email"
                                                            className="form-control"
                                                            id="umail"
                                                            placeholder="Email"
                                                            name='email'
                                                            value={values.email}
                                                            onChange={handleChange}
                                                            required
                                                            isValid={touched.email && !errors.email}
                                                            isInvalid={!!errors.email}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.email}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                                <button type="submit" className="bb-btn-2" name="subscribe">Subscribe</button>
                                            </Form>
                                        )
                                    }}
                                </Formik>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </>
    )
}

export default NewsletterModal
