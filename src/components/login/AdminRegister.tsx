"use client"
import React, { useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/loginSlice'
import { Formik, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { authStorage } from '@/utils/authStorage';
import Link from 'next/link';

interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    conformPassword: string;
}

const AdminRegister = () => {
    const router = useRouter()
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const schema = yup.object().shape({
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        conformPassword: yup.string()
            .oneOf([yup.ref('password')], 'Passwords must match')
            .min(6, "Confirm Password must be at least 6 characters")
            .required("Confirm Password is required"),
        firstName: yup.string().required("First Name is required"),
        lastName: yup.string(),
        phoneNumber: yup.string()
            .min(10, "Phone number must be at least 10 digits")
            .matches(/^[0-9]+$/, "Phone number must contain only digits")
            .required("Phone Number is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
    });

    const initialValues: FormValues = {
        firstName: "" as string,
        lastName: "" as string,
        email: "" as string,
        phoneNumber: "" as string,
        password: "" as string,
        conformPassword: "" as string,
    };

    const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        setIsSubmitting(true);
        formikHelpers.setSubmitting(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://menhaapi.smartseyali.app';
            
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    password: values.password,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    role: 'admin' // Explicitly setting role to admin
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Registration failed response:', data);
                let errorMessage = data.message || 'Registration failed';
                if (data.errors) {
                    if (Array.isArray(data.errors) && data.errors.length > 0) {
                        errorMessage = data.errors.map((e: any) => e.message || JSON.stringify(e)).join(', ');
                    } else if (typeof data.errors === 'string') {
                        errorMessage = data.errors;
                    }
                }
                throw new Error(errorMessage);
            }

            // Store token
            authStorage.setToken(data.token);
            authStorage.setUserData(data.user);

            // Store user in Redux
            dispatch(login({
                id: data.user.id,
                email: data.user.email,
                phoneNumber: data.user.phone_number,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                role: data.user.role || 'customer',
                token: data.token,
            }));

            showSuccessToast("Admin Registration successful!");
            formikHelpers.resetForm();
            router.push('/admin');

        } catch (error: any) {
            console.error('Registration error:', error);
            showErrorToast(error.message || 'Registration failed. Please try again.');
            formikHelpers.setSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="section-register padding-tb-50">
            <div className="container">
                <Row>
                    <Col>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="bb-register" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            <Row>
                                <Col sm={12}>
                                    <div className="section-title bb-center">
                                        <div className="section-detail">
                                            <h2 className="bb-title">Admin <span>Register</span></h2>
                                            <p>Create a new administrative account</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={12}>
                                    <Formik
                                        validationSchema={schema}
                                        onSubmit={handleSubmit}
                                        initialValues={initialValues}
                                    >{({
                                        handleSubmit,
                                        handleChange,
                                        values,
                                        errors,
                                    }: FormikProps<FormValues>) => (
                                        <Form noValidate onSubmit={handleSubmit} method="post">
                                            <div className="bb-register-wrap bb-register-width-50">
                                                <label>First Name*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.firstName || ""} onChange={handleChange} type="text" name="firstName" placeholder="Enter your first name" required isInvalid={!!errors.firstName} />
                                                        <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            <div className="bb-register-wrap bb-register-width-50">
                                                <label>Last Name</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.lastName || ""} onChange={handleChange} isInvalid={!!errors.lastName} type="text" name="lastName" placeholder="Enter your Last name" />
                                                        <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            
                                            <div className="bb-register-wrap bb-register-width-100">
                                                <label>Email*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.email || ""} onChange={handleChange} isInvalid={!!errors.email} type="email" name="email" placeholder="Enter your email" required />
                                                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>

                                            <div className="bb-register-wrap bb-register-width-50">
                                                <label>Phone Number*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.phoneNumber || ""} onChange={handleChange} isInvalid={!!errors.phoneNumber} type="tel" name="phoneNumber" placeholder="Enter your phone number" required />
                                                        <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            <div className="bb-register-wrap bb-register-width-50">
                                                <label>Password*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.password || ""} onChange={handleChange} isInvalid={!!errors.password} type="password" name="password" placeholder="Enter your password" required />
                                                        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            <div className="bb-register-wrap bb-register-width-50">
                                                <label>Confirm Password*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control value={values.conformPassword || ""} onChange={handleChange} isInvalid={!!errors.conformPassword} type="password" name="conformPassword" placeholder="Confirm your password" required />
                                                        <Form.Control.Feedback type="invalid">{errors.conformPassword}</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            
                                            <div className="bb-register-button">
                                                <button type="submit" className="bb-btn-2" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Registering...' : 'Register as Admin'}
                                                </button>
                                                <Link href="/admin/login" className="ms-3">Back to Login</Link>
                                            </div>
                                        </Form>
                                    )}
                                    </Formik>
                                </Col>
                            </Row>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default AdminRegister;
