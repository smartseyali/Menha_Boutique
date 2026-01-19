"use client"
import { RootState } from '@/store';
import { login } from '@/store/reducer/loginSlice';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useDispatch, useSelector } from 'react-redux';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';
import { Formik, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import Link from 'next/link';
import { authStorage } from '@/utils/authStorage';

interface FormValues {
    identifier: string;
    password: string;
}

const Login = () => {
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const user = useSelector((state: RootState) => state.login.user);
    const dispatch = useDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            // Check user role and redirect accordingly
            const userRole = user?.role || 'customer';
            
            if (userRole === 'admin' || userRole === 'superadmin') {
                router.push('/admin');
            } else {
                 // Do not redirect to / or logout
                 // dispatch(logout()); // optional
            }
        }
    }, [isAuthenticated, user, router])

    const schema = yup.object().shape({
        identifier: yup.string()
            .required("Phone Number or Email is required")
            .test('test-name', 'Must be a valid email or phone number', function(value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phoneRegex = /^[0-9]{10,}$/;
                let isValidEmail = emailRegex.test(value as string);
                
                // For phone, strip spaces/dashes if you want, but sticking to digits for now as per previous
                let isValidPhone = phoneRegex.test(value as string);
                
                if (!isValidEmail && !isValidPhone) {
                    return false;
                }
                return true;
            }),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    });

    const initialValues: FormValues = {
        identifier: "" as string,
        password: "" as string,
    };

    const handleLoginBtn = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        setIsSubmitting(true);
        formikHelpers.setSubmitting(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';
            
            const isEmail = values.identifier.includes('@');
            const loginPayload = {
                password: values.password,
                ...(isEmail ? { email: values.identifier } : { phoneNumber: values.identifier })
            };

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid phone number or password');
            }

            // Store token securely in sessionStorage (not localStorage)
            authStorage.setToken(data.token);
            authStorage.setUserData(data.user);

            // Store user data in Redux (without password)
            dispatch(login({
                id: data.user.id,
                email: data.user.email,
                phoneNumber: data.user.phone_number,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                role: data.user.role || 'customer',
                token: data.token,
            }));

            showSuccessToast("User login successful!");
            formikHelpers.resetForm();
            
            // Redirect based on role
            // Redirect based on role
            if (data.user.role === 'admin' || data.user.role === 'superadmin') {
                router.push('/admin');
            } else {
                showErrorToast('Access Denied: administrative access only.');
                // clear auth if strictly needed, but showing error is enough
            }
        } catch (error: any) {
            console.error('Login error:', error);
            showErrorToast(error.message || 'Login failed. Please try again.');
            formikHelpers.setSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="section-login padding-tb-50">
            <div className="container">
                <Row>
                    <Col sm={12}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="section-title bb-center" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            <div className="section-detail">
                                <h2 className="bb-title">Admin <span>Login</span></h2>
                                <p>Menha Boutique Administration</p>
                            </div>
                        </Fade>
                    </Col>
                    <Col sm={12}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200} className="bb-login-contact">
                            <Formik
                                validationSchema={schema}
                                onSubmit={handleLoginBtn}
                                initialValues={initialValues}>{({
                                    handleSubmit,
                                    handleChange,
                                    values,
                                    errors,
                                }: FormikProps<FormValues>) => {
                                    return (
                                        <Form noValidate onSubmit={handleSubmit}>
                                            <div className="bb-login-wrap">
                                                <label htmlFor="identifier">Phone Number or Email*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control 
                                                            onChange={handleChange} 
                                                            value={values.identifier || ""} 
                                                            type="text" 
                                                            id="identifier" 
                                                            name="identifier" 
                                                            placeholder="Enter Your Phone Number or Email" 
                                                            required 
                                                            isInvalid={!!errors.identifier} 
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.identifier}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            <div className="bb-login-wrap">
                                                <label htmlFor="password">Password*</label>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control onChange={handleChange} value={values.password || ""} type="password" id="password" name="password" placeholder="Enter Your Password" isInvalid={!!errors.password} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.password}
                                                        </Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </div>
                                            <div className="bb-login-wrap">
                                                <a onClick={(e) => e.preventDefault()} href="#">Forgot Password?</a>
                                            </div>
                                            <div className="bb-login-button">
                                                <button className="bb-btn-2" type="submit" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                                </button>
                                                <Link href="/admin/register">Register New Admin</Link>
                                            </div>
                                        </Form>
                                    )
                                }}
                            </Formik>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default Login
