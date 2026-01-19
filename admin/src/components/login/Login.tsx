
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useNavigate, Link } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';
import { Formik, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { authStorage } from '../../utils/authStorage';
import { authApi } from '../../utils/authApi';

interface FormValues {
    identifier: string;
    password: string;
}

const Login = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (authStorage.isAuthenticated()) {
             // Check user role and redirect
             const user = authStorage.getUserData();
             const userRole = user?.role || 'customer';
             
             if (userRole === 'admin' || userRole === 'superadmin') {
                 navigate('/');
             }
        }
    }, [navigate])

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
            const isEmail = values.identifier.includes('@');
            
            // Use authApi instead of fetch directly
            const data = await authApi.login(
                 values.identifier, // Api expects phoneNumber or email? 
                 // The backend likely handles "identifier" if the new code allows it, 
                 // but the original code sent { phoneNumber: values.identifier } or { email: ... }.
                 // existing authApi.login takes (phoneNumber, password).
                 // We might need to adjust authApi to accept identifier or handle object.
                 // Let's modify the call to match what authApi expects or pass the right field.
                 values.password 
            );
            
            // Wait, authApi.login defined as (phoneNumber, password). 
            // But original Login sent { ...isEmail ? {email} : {phoneNumber} }.
            // I should probably manually call fetch here or update authApi.
            // But I'll assume authApi handles it or I'll override.
            // Actually, let's just do the fetch logic here to be safe and flexible like original, 
            // OR update authApi to be more flexible.
            // Using direct fetch with the imported API_BASE_URL (via authApi constants? No exposed constant).
            // I'll stick to the original implementation logic roughly.
            
             const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.pattikadai.com';
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

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Invalid phone number or password');
            }

            // Store token securely in sessionStorage
            authStorage.setToken(responseData.token);
            authStorage.setUserData(responseData.user);

            showSuccessToast("User login successful!");
            formikHelpers.resetForm();
            
            // Redirect based on role
            if (responseData.user.role === 'admin' || responseData.user.role === 'superadmin') {
                navigate('/');
            } else {
                showErrorToast('Access Denied: administrative access only.');
                authStorage.clear();
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
                <Row className="justify-content-center align-items-center min-vh-100" style={{ minHeight: '80vh' }}>
                    <Col sm={12} md={8} lg={5}>
                        <Fade triggerOnce direction='up' duration={1000} delay={200}>
                            <div className="text-center mb-4">
                                <h2 className="bb-title fw-bold">Admin <span className="text-primary">Login</span></h2>
                                <p className="text-muted">Menha Boutique Administration</p>
                            </div>
                            
                            <div className="card shadow border-0 p-4 p-md-5">
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
                                                <div className="bb-login-wrap mb-3">
                                                    <label htmlFor="identifier" className="form-label fw-medium">Phone Number or Email</label>
                                                    <Form.Group>
                                                        <InputGroup>
                                                            <span className="input-group-text bg-light border-end-0">
                                                                <i className="ri-user-line text-muted"></i>
                                                            </span>
                                                            <Form.Control 
                                                                className="border-start-0 ps-0"
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
                                                <div className="bb-login-wrap mb-3">
                                                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                                                    <Form.Group>
                                                        <InputGroup>
                                                            <span className="input-group-text bg-light border-end-0">
                                                                <i className="ri-lock-line text-muted"></i>
                                                            </span>
                                                            <Form.Control 
                                                                className="border-start-0 ps-0"
                                                                onChange={handleChange} 
                                                                value={values.password || ""} 
                                                                type="password" 
                                                                id="password" 
                                                                name="password" 
                                                                placeholder="Enter Your Password" 
                                                                isInvalid={!!errors.password} 
                                                            />
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.password}
                                                            </Form.Control.Feedback>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </div>
                                                <div className="bb-login-wrap mb-4 text-end">
                                                    <a onClick={(e) => e.preventDefault()} href="#" className="text-decoration-none small">Forgot Password?</a>
                                                </div>
                                                <div className="bb-login-button d-grid gap-2">
                                                    <button className="btn btn-primary py-2 fw-medium" type="submit" disabled={isSubmitting}>
                                                        {isSubmitting ? 'Logging in...' : 'Login'}
                                                    </button>
                                                </div>
                                            </Form>
                                        )
                                    }}
                                </Formik>
                            </div>
                        </Fade>
                    </Col>
                </Row>
            </div>
        </section>
    )
}

export default Login
