import React from 'react'
import { Fade } from 'react-awesome-reveal';
import { Col, Form, InputGroup, Row } from 'react-bootstrap'
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
interface FormValues {
    email: string;
}

const Contact = () => {
    const schema = yup.object().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().required(),
        phoneNumber: yup.string().required(),
        message: yup.string().required(),
    });

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
            <section className="section-contact padding-tb-50">
                <div className="container">
                    <Row className="mb-minus-24">
                        <Col sm={12}>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                                <div className="section-detail">
                                    <h2 className="bb-title">Get In <span>Touch</span></h2>
                                    <p>{"Please select a topic below related to you inquiry. If you don't fint what you need, fill out our contact form."}</p>
                                </div>
                            </Fade>
                        </Col>
                        <Col lg={6} sm={12} className="mb-24">
                            <Fade triggerOnce direction='up' duration={1000} delay={400} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400">
                                <div className="bb-contact-form">
                                    <Formik
                                        validationSchema={schema}
                                        onSubmit={handleSubmit}
                                        initialValues={initialValues}
                                    >
                                        {({
                                            handleSubmit,
                                            handleChange,
                                            values,
                                            touched,
                                            errors,
                                        }: any) => {
                                            return (
                                                <Form noValidate onSubmit={handleSubmit}>
                                                    <Form.Group className="bb-contact-wrap">
                                                        <Form.Control
                                                            type="text"
                                                            className="form-control"
                                                            id="fname"
                                                            placeholder="Enter Your First Name"
                                                            required
                                                            name="firstName"
                                                            value={values.firstName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.firstName}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.firstName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group className="bb-contact-wrap">
                                                        <Form.Control
                                                            type="text"
                                                            className="form-control"
                                                            id="lname"
                                                            placeholder="Enter Your Last Name"
                                                            required
                                                            name="lastName"
                                                            value={values.lastName}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.lastName}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.lastName}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group className="bb-contact-wrap">
                                                        <InputGroup>
                                                            <Form.Control
                                                                type="email"
                                                                className="form-control"
                                                                id="umail"
                                                                placeholder="Enter Your Email"
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
                                                    <Form.Group className="bb-contact-wrap">
                                                        <Form.Control
                                                            type="text"
                                                            className="form-control"
                                                            id="phone"
                                                            placeholder="Enter Your Phone Number"
                                                            pattern="^\d{10,12}$"
                                                            required
                                                            name="phoneNumber"
                                                            value={values.phoneNumber}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.phoneNumber}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.phoneNumber}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <Form.Group className="bb-contact-wrap">
                                                        <Form.Control
                                                            as="textarea"
                                                            className="form-control"
                                                            id="exampleFormControlTextarea1"
                                                            rows={3}
                                                            placeholder="Please leave your comments here..."
                                                            required
                                                            name="message"
                                                            value={values.message}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.message}
                                                        ></Form.Control>
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.message}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
                                                    <div className='bb-contact-button'>
                                                        <button type="submit" className="bb-btn-2">
                                                            Submit
                                                        </button>
                                                    </div>
                                                </Form>
                                            )
                                        }}
                                    </Formik>
                                </div>
                            </Fade>
                        </Col>
                        <Col lg={6} sm={12}>
                            <Fade triggerOnce direction='up' duration={1000} delay={600} data-aos="fade-up" data-aos-duration="1000" data-aos-delay="600">
                                <div className="bb-contact-maps">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d929.6923186886103!2d72.9043573711624!3d21.240995949535076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1718947386404!5m2!1sen!2sin"
                                        loading="lazy"></iframe>
                                </div>
                            </Fade>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Contact
