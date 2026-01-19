"use client"
import React, { useState, useEffect } from 'react'
import { Fade } from 'react-awesome-reveal'
import { showSuccessToast, showErrorToast } from '../toast-popup/Toastify'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/loginSlice'
import { Formik, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { authStorage } from '@/utils/authStorage';
import locationsData from '@/data/locations.json';

interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    postCode: string;
    conformPassword: string;
    country: string;
    state: string;
    city: string;
}

const Register = () => {
    const router = useRouter()
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);

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
        address: yup.string().required("Address is required"),
        postCode: yup.string().min(6, "Post Code must be at least 6 characters").required("Post Code is required"),
        country: yup.string().required("Country is required"),
        state: yup.string().required("State is required"),
        city: yup.string().required("City is required"),
    });

    const initialValues: FormValues = {
        firstName: "" as string,
        lastName: "" as string,
        email: "" as string,
        phoneNumber: "" as string,
        address: "" as string,
        city: "" as string,
        postCode: "" as string,
        country: "" as string,
        state: "" as string,
        password: "" as string,
        conformPassword: "" as string,
    };

    const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        setIsSubmitting(true);
        formikHelpers.setSubmitting(true);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';
            
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
                    address: values.address,
                    city: values.city,
                    postCode: values.postCode,
                    country: values.country,
                    state: values.state,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Log the full error for debugging
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

            // Store token securely in sessionStorage
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

            showSuccessToast("Registration successful!");
            formikHelpers.resetForm();
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            showErrorToast(error.message || 'Registration failed. Please try again.');
            formikHelpers.setSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <section className="section-register padding-tb-50">
                <div className="container">
                    <Row>
                        <Col>
                            <Fade triggerOnce direction='up' duration={1000} delay={200} className="bb-register" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                                <Row>
                                    <Col sm={12}>
                                        <div className="section-title bb-center">
                                            <div className="section-detail">
                                                <h2 className="bb-title">Register</h2>
                                                <p>Best place to buy and sell digital products</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={12}>
                                        <Formik
                                            validationSchema={schema}
                                            onSubmit={handleSubmit}
                                            initialValues={initialValues}
                                        >{({
                                            setFieldValue,
                                            handleSubmit,
                                            handleChange,
                                            values,
                                            errors,
                                        }: FormikProps<FormValues>) => {
                                            
                                            // Handle Country Change
                                            const handleCountryChange = (e: React.ChangeEvent<any>) => {
                                                const selectedCountry = e.target.value;
                                                handleChange(e);
                                                setFieldValue('state', ''); // Reset state
                                                setFieldValue('city', '');   // Reset city
                                                
                                                const countryData = locationsData.find(c => c.name === selectedCountry);
                                                setAvailableStates(countryData ? countryData.states : []);
                                                setAvailableCities([]);
                                            };

                                            // Handle State Change
                                            const handleStateChange = (e: React.ChangeEvent<any>) => {
                                                const selectedState = e.target.value;
                                                handleChange(e);
                                                setFieldValue('city', ''); // Reset city
                                                
                                                const stateData = availableStates.find(s => s.name === selectedState);
                                                setAvailableCities(stateData ? stateData.cities : []);
                                            };

                                            return (
                                                <Form noValidate onSubmit={handleSubmit} method="post">
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>First Name*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.firstName || ""} onChange={handleChange} type="text" name="firstName" placeholder="Enter your first name" required isInvalid={!!errors.firstName} />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.firstName}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Last Name</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.lastName || ""} onChange={handleChange} isInvalid={!!errors.lastName} type="text" name="lastName" placeholder="Enter your Last name" />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.lastName}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    
                                                    <div className="bb-register-wrap bb-register-width-100">
                                                        <label>Email*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.email || ""} onChange={handleChange} isInvalid={!!errors.email} type="email" name="email" placeholder="Enter your email" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.email}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>

                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Phone Number*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.phoneNumber || ""} onChange={handleChange} isInvalid={!!errors.phoneNumber} type="tel" name="phoneNumber" placeholder="Enter your phone number" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.phoneNumber}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Password*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.password || ""} onChange={handleChange} isInvalid={!!errors.password} type="password" name="password" placeholder="Enter your password" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.password}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Confirm Password*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.conformPassword || ""} onChange={handleChange} isInvalid={!!errors.conformPassword} type="password" name="conformPassword" placeholder="Confirm your password" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.conformPassword}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-100">

                                                        <label>Address*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.address || ""} onChange={handleChange} isInvalid={!!errors.address} type="text" name="address" placeholder="Address Line 1" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.address}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Country*</label>
                                                        <Form.Group >
                                                            <InputGroup>
                                                                <Form.Select 
                                                                    value={values.country || ""} 
                                                                    isInvalid={!!errors.country} 
                                                                    onChange={handleCountryChange} 
                                                                    name='country' 
                                                                    className="custom-select" 
                                                                    required
                                                                >
                                                                    <option value='' disabled>Select Country</option>
                                                                    {locationsData.map((country: any, index: number) => (
                                                                        <option key={index} value={country.name}>{country.name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.country}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>Region State*</label>
                                                        <Form.Group >
                                                            <InputGroup>
                                                                <Form.Select 
                                                                    value={values.state || ""} 
                                                                    isInvalid={!!errors.state} 
                                                                    onChange={handleStateChange} 
                                                                    name='state' 
                                                                    className="custom-select" 
                                                                    required
                                                                    disabled={!values.country}
                                                                >
                                                                    <option value='' disabled>Select State</option>
                                                                    {availableStates.map((state: any, index: number) => (
                                                                        <option key={index} value={state.name}>{state.name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.state}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">
                                                        <label>City*</label>
                                                        <Form.Group >
                                                            <InputGroup>
                                                                <Form.Select 
                                                                    value={values.city || ""} 
                                                                    isInvalid={!!errors.city} 
                                                                    name='city' 
                                                                    onChange={handleChange} 
                                                                    className="custom-select" 
                                                                    required
                                                                    disabled={!values.state}
                                                                >
                                                                    <option value='' disabled>Select City</option>
                                                                    {availableCities.map((city: string, index: number) => (
                                                                        <option key={index} value={city}>{city}</option>
                                                                    ))}
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.city}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-wrap bb-register-width-50">

                                                        <label>Post Code*</label>
                                                        <Form.Group>
                                                            <InputGroup>
                                                                <Form.Control value={values.postCode || ""} onChange={handleChange} isInvalid={!!errors.postCode} type="text" name="postCode" placeholder="Post Code" required />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.postCode}
                                                                </Form.Control.Feedback>
                                                            </InputGroup>
                                                        </Form.Group>
                                                    </div>
                                                    <div className="bb-register-button">
                                                        <button type="submit" className="bb-btn-2" disabled={isSubmitting}>
                                                            {isSubmitting ? 'Registering...' : 'Register'}
                                                        </button>
                                                    </div>
                                                </Form>
                                            )
                                        }}
                                        </Formik>
                                    </Col>
                                </Row>
                            </Fade>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Register;
