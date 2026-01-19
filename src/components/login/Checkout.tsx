"use client"
import { RootState } from '@/store';
import React, { useEffect, useState } from 'react'
import { Fade } from 'react-awesome-reveal'
import { useDispatch, useSelector } from 'react-redux';

import StarRating from '../stars/StarRating';
import { useRouter } from 'next/navigation';
import { showErrorToast, showSuccessToast } from '../toast-popup/Toastify';
import { Formik, FormikHelpers, FormikProps } from "formik";
import * as yup from "yup";
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { addOrder, clearCart, setOrders } from '@/store/reducer/cartSlice';
import { useLoadOrders } from '@/hooks/useOrders';
import { login } from '@/store/reducer/loginSlice';
import { getAttributionForConversion } from '@/utils/attribution';
import PaymentGateway from '../payment/PaymentGateway';
import { orderApi, addressApi, deliveryApi, paymentApi } from '@/utils/api';
import { cartApi } from '@/utils/api';
import { authStorage } from '@/utils/authStorage';
import locationsData from '@/data/locations.json';
import { initiateRazorpayPayment, getPaymentCallbackUrl } from '@/utils/payment';

interface FormValues {
    id: string;
    firstName: string;
    lastName: string;
    address: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    postCode: string;
    country: string;
    state: string;
    city: string;
}
interface userValues {
    phoneNumber: string;
    password: string;
}
interface Registration {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    city: string;
    postCode: string;
    country: string;
    state: string;
    password: string;
    uid: any;
}

interface Option {
    value: string;
    tooltip: string;
}

const Checkout = () => {
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const userEmail = useSelector((state: RootState) => state.login.user?.email);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const router = useRouter()
    const dispatch = useDispatch()
    const cartSlice = useSelector((state: RootState) => state.cart?.items);
    const orders = useSelector((state: RootState) => state.cart.orders);
    const [subTotal, setSubTotal] = useState(0);
    const [deliveryCharge, setDeliveryCharge] = useState(0);


    const [selectedMethod, setSelectedMethod] = useState("standard");
    const [checkOutMethod, setCheckOutMethod] = useState("register");
    const [billingAddressMethod, setBillingAddressMethod] = useState("new");
    const [loginVisible, setLoginVisible] = useState(false);
    const [btnVisible, setBtnVisible] = useState(false);
    const [textVisible, setTextVisible] = useState(false);
    const [billingVisible, setBillingVisible] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState<FormValues | null>(null);
    const [addressVisible, setAddressVisible] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState<{ [key: number]: number }>({});
    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [countries, setCountries] = useState<any[]>(locationsData);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [guestEmail, setGuestEmail] = useState("");

    // New state for dynamic delivery calculation
    const [currentDataForDelivery, setCurrentDataForDelivery] = useState<string>("");

    const handleClick = (index: any, optionIndex: any) => {
        setActiveIndex({
            ...activeIndex,
            [index]: optionIndex,
        });
    };

    useEffect(() => {
        const defaultSelections = cartSlice.reduce((acc, _, index) => {
            acc[index] = 0;
            return acc;
        }, {} as { [key: number]: number });

        setActiveIndex(defaultSelections);
    }, [cartSlice]);

    useEffect(() => {
        if (cartSlice.length === 0) {
            setSubTotal(0);
            return;
        }
        const subtotal = cartSlice.reduce(
            (acc, item) => acc + item.newPrice * item.quantity,
            0
        );
        setSubTotal(subtotal);
    }, [cartSlice]);

    // Calculate delivery charge when state (from address or form) or cart changes
    useEffect(() => {
        const parseWeightToGrams = (weightStr: string): number => {
            if (!weightStr) return 0;
            const normalized = weightStr.toLowerCase().trim().replace(/\s/g, '');
            const value = parseFloat(normalized);
            if (isNaN(value)) return 0;

            if (normalized.includes('kg')) {
                return value * 1000;
            } else if (normalized.includes('g') || normalized.includes('ml')) {
                return value;
            }
            return 0;
        };

        const formatGramsToWeight = (grams: number): string => {
            if (grams >= 1000) {
                return `${grams / 1000}kg`;
            }
            return `${grams}g`;
        };

        const calculateDelivery = async () => {
            if (currentDataForDelivery && cartSlice.length > 0) {
                // Map cart items to send to backend for calculation
                const items = cartSlice.map((item: any, index: number) => {
                    let weightVal = item.weight;
                    
                    // If item has attributes (variations), pick selected one
                    if (item.attributes && item.attributes.length > 0) {
                        const selectedAttrIndex = activeIndex[index] || 0;
                        if (item.attributes[selectedAttrIndex]) {
                            weightVal = item.attributes[selectedAttrIndex].attributeValue;
                        }
                    }
                    
                    return {
                        weight: weightVal,
                        attributeValue: weightVal, // Backend checks this too
                        quantity: item.quantity || 1
                    };
                });

                const charge = await deliveryApi.calculate({
                    state: currentDataForDelivery,
                    items: items
                });
                setDeliveryCharge(charge);
            } else {
                setDeliveryCharge(0);
            }
        };
        calculateDelivery();
    }, [currentDataForDelivery, cartSlice, activeIndex]);

    const total = subTotal + deliveryCharge;

    // Load existing addresses from database when user is authenticated
    useEffect(() => {
        const loadAddresses = async () => {
            if (isAuthenticated) {
                try {
                    const addresses = await addressApi.getAll();
                    // Map addresses to frontend format
                    const mappedAddresses = addresses.map((addr: any) => ({
                        id: addr.id,
                        firstName: addr.first_name || addr.firstName,
                        lastName: addr.last_name || addr.lastName,
                        address: addr.address_line || addr.addressLine || addr.address,
                        city: addr.city,
                        postCode: addr.postal_code || addr.postalCode || addr.postCode,
                        country: addr.country_name || addr.country || '',
                        state: addr.state_name || addr.state || '',
                        is_default: addr.is_default || false,
                        email: userEmail || '',
                    }));
                    setAddressVisible(mappedAddresses);

                    // Select default address if available and no address is currently selected
                    if (mappedAddresses.length > 0 && !selectedAddress) {
                        const defaultAddress = mappedAddresses.find((addr: any) => addr.is_default) || mappedAddresses[0];
                        setSelectedAddress(defaultAddress);
                        setCurrentDataForDelivery(defaultAddress.state);
                        setBillingAddressMethod("use");
                    }
                } catch (error) {
                    console.error('Error loading addresses:', error);
                    setAddressVisible([]);
                }
            } else {
                setAddressVisible([]);
                setSelectedAddress(null);
            }
        };
        loadAddresses();
        // Only reload when authentication status changes, not when selectedAddress changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    useEffect(() => {
        if (selectedAddress) {
            setBillingAddressMethod("use");
            setCurrentDataForDelivery(selectedAddress.state);
        } else {
            setBillingAddressMethod("new");
            setCurrentDataForDelivery("");
        }
    }, [selectedAddress]);

    // Track begin_checkout when user lands on checkout page
    useEffect(() => {
        if (cartSlice.length > 0 && typeof window !== 'undefined') {
            const attribution = getAttributionForConversion();
            const subtotal = cartSlice.reduce(
                (acc, item) => acc + item.newPrice * item.quantity,
                0
            );

            const items = cartSlice.map((item: any) => ({
                item_id: item.id?.toString() || '',
                item_name: item.title || '',
                item_category: item.category || '',
                price: item.newPrice || 0,
                quantity: item.quantity || 1,
            }));

            // Track begin_checkout in Google Analytics
            if ((window as any).gtag) {
                (window as any).gtag('event', 'begin_checkout', {
                    currency: 'INR',
                    value: subtotal,
                    items: items,
                    source: attribution?.source || 'direct',
                    medium: attribution?.medium || 'none',
                    campaign: attribution?.campaign || '',
                });
            }

            // Track InitiateCheckout in Meta Pixel
            if ((window as any).fbq) {
                (window as any).fbq('track', 'InitiateCheckout', {
                    value: subtotal,
                    currency: 'INR',
                    contents: items,
                    num_items: cartSlice.length,
                    source: attribution?.source || 'direct',
                    medium: attribution?.medium || 'none',
                });
            }
        }
    }, [cartSlice])

    const generateRandomId: any = () => {
        const randomNum = Math.floor(Math.random() * 100000);
        return `${randomNum}`;
    };

    const randomId = generateRandomId();

    const handleCheckout = async () => {
        if (!selectedAddress) {
            showErrorToast("Please select a billing address.");
            return;
        }

        if (isCreatingOrder) {
            return;
        }

        try {
            setIsCreatingOrder(true);

            // Check if user is authenticated
            // Check if user is authenticated
            const token = authStorage.getToken();
            const loginUser = typeof window !== 'undefined' 
                ? (authStorage.getUserData() || {})
                : {};

            if (!token && checkOutMethod !== 'guest') {
                showErrorToast("Please login to place an order.");
                setIsCreatingOrder(false);
                return;
            }

            // Prepare order items
            const items = cartSlice.map((item: any) => ({
                productId: item.productId || item.id,
                quantity: item.quantity || 1,
                price: item.newPrice || 0,
            }));

            // Use address ID from selected address (already saved in database)
            let addressId = selectedAddress.id;
            
            // If address doesn't have a valid UUID, it might be a new address - create it
            // UUIDs are typically 36 characters long with dashes
            if (!addressId || addressId.length < 30) {
                // Create address on backend
                try {
                    // Find country and state IDs if needed
                    const selectedCountry = locationsData.find(c => c.name === selectedAddress.country);
                    const selectedState = selectedCountry?.states.find((s: any) => s.name === selectedAddress.state);
                    
                    const addressData = {
                        firstName: selectedAddress.firstName,
                        lastName: selectedAddress.lastName,
                        addressLine: selectedAddress.address,
                        city: selectedAddress.city,
                        postalCode: selectedAddress.postCode,
                        state: selectedState?.name || selectedAddress.state,
                        stateName: selectedState?.name || selectedAddress.state,
                        country: selectedCountry?.name || selectedAddress.country,
                        countryName: selectedCountry?.name || selectedAddress.country,
                        addressType: 'billing',
                        isDefault: false,
                    };
                    const createdAddress = await addressApi.create(addressData, !isAuthenticated);
                    addressId = createdAddress.id;
                } catch (error: any) {
                    console.error('Error creating address:', error);
                    showErrorToast("Failed to save address. Please try again.");
                    setIsCreatingOrder(false);
                    return;
                }
            }

            // Create order on backend
            const orderData = {
                shippingAddressId: addressId,
                billingAddressId: addressId,
                shippingMethod: selectedMethod,
                items: items,
                couponCode: null,
                paymentMethod: paymentMethod,
                deliveryCharge: deliveryCharge, // Pass delivery charge to backend
                email: isAuthenticated ? loginUser.email : guestEmail,
            };

            const orderResponse = await orderApi.create(orderData, !isAuthenticated);
            const createdOrder = orderResponse.order;

            if (!createdOrder) {
                throw new Error("Failed to create order");
            }

            // Get attribution data for conversion tracking
            const attribution = getAttributionForConversion();

            // Clear cart immediately as order is placed
            dispatch(clearCart());
            
            if (!isAuthenticated && createdOrder.order_number) {
                 sessionStorage.setItem('guest_last_order_id', createdOrder.order_number);
            }

            // Handle payment method - Always Razorpay
            try {
                // Create payment order on backend
                const paymentOrder = await paymentApi.createOrder({
                    orderId: createdOrder.id,
                    gateway: 'razorpay',
                    amount: total,
                    currency: 'INR',
                    callbackUrl: getPaymentCallbackUrl('razorpay'),
                });
                
                if (!paymentOrder || !paymentOrder.orderId) {
                    throw new Error('Failed to create payment order');
                }

                // Initialize Razorpay payment
                await initiateRazorpayPayment({
                    orderId: paymentOrder.orderId,
                    amount: paymentOrder.amount,
                    currency: paymentOrder.currency,
                    keyId: paymentOrder.keyId,
                    name: 'Pattikadai',
                    description: `Order Payment for Order #${createdOrder.order_number}`,
                    prefill: {
                        email: loginUser.email || guestEmail || '',
                        contact: loginUser.phoneNumber || '',
                    },
                    handler: async (response: any) => {
                        try {
                            // Verify payment on backend
                            const verificationResult = await paymentApi.verifyPayment({
                                orderId: createdOrder.id,
                                gateway: 'razorpay',
                                paymentData: {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                },
                            });

                            if (verificationResult.success) {
                                showSuccessToast("Payment successful! Order placed.");
                            } else {
                                showErrorToast('Payment verification failed');
                            }
                        } catch (error: any) {
                            console.error('Payment verification error:', error);
                            showErrorToast(error.message || 'Payment verification failed');
                        } finally {
                            // Always redirect to My Orders per requirement
                            router.push("/my-orders");
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setIsCreatingOrder(false);
                            // Redirect when closed intentionally
                            router.push("/my-orders");
                        },
                    },
                });
            } catch (error: any) {
                console.error('Razorpay init error:', error);
                showErrorToast(error.message || "Failed to initialize payment.");
                setIsCreatingOrder(false);
                // Redirect even on init failure so user can access Pay Now in My Orders
                router.push("/my-orders");
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            showErrorToast(error.message || "Failed to place order. Please try again.");
            setIsCreatingOrder(false);
        }
    }

    const handlePaymentSuccess = (paymentId: string) => {
        showSuccessToast("Payment successful! Order placed.");
        dispatch(clearCart());
        // Since we might be inside the handler where createdOrderId state isn't set yet if we skipped it
        // We use the passed paymentId (which acts as orderId here)
        if (!isAuthenticated && paymentId) {
            sessionStorage.setItem('guest_last_order_id', paymentId);
        }
        router.push("/orders");
    };

    const handlePaymentError = (errorMessage: string) => {
        showErrorToast(errorMessage || "Payment failed. Please try again.");
        setIsCreatingOrder(false);
    };

    const handleCheckOutChange = (e: any) => {
        setCheckOutMethod(e.target.value);
        if (e.target.value === 'login') {
            setLoginVisible(true);
            setBtnVisible(false);
            setTextVisible(false);
            setBillingVisible(false);

        } else {
            setLoginVisible(false);
            setBtnVisible(true);
            setTextVisible(true);
            setBillingVisible(false);
        }
    }

    const handleBillingAddressChange = (e: any) => {
        setBillingAddressMethod(e.target.value);
        if (e.target.value === 'new') {
            setSelectedAddress(null);
        }
    }

    const handleContinueBtn = () => {
        setBtnVisible(false);
        setTextVisible(false);
        setBillingVisible(true);
    }



    const handleSelectAddress = (address: any) => {
        setSelectedAddress(address);
        setBillingAddressMethod("use");
    }

    const handleRemoveAddress = async (id: string) => {
        try {
            await addressApi.delete(id);
            const updatedAddresses = addressVisible.filter((addr) => addr.id !== id);
            setAddressVisible(updatedAddresses);
            if (selectedAddress && selectedAddress.id === id) {
                setSelectedAddress(null);
                setBillingAddressMethod("new");
            }
            showSuccessToast("Address removed successfully");
        } catch (error) {
            console.error('Error removing address:', error);
            showErrorToast("Failed to remove address");
        }
    }

    const schema = yup.object().shape({
        firstName: yup.string().required("First Name is required"),
        lastName: yup.string(),
        email: yup.string().email("Invalid email").required("Email is required"),
        phoneNumber: !isAuthenticated 
            ? yup.string()
                .min(10, "Phone number must be at least 10 digits")
                .matches(/^[0-9]+$/, "Phone number must contain only digits")
                .required("Phone Number is required")
            : yup.string().optional(),
        password: !isAuthenticated
            ? yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
            : yup.string().optional(),
        confirmPassword: !isAuthenticated
            ? yup.string()
                .oneOf([yup.ref('password')], 'Passwords must match')
                .min(6, "Confirm Password must be at least 6 characters")
                .required("Confirm Password is required")
            : yup.string().optional(),
        address: yup.string().required("Address is required"),
        city: yup.string().required("City is required"),
        postCode: yup.string().required("Post Code is required"),
        country: yup.string().required("Country is required"),
        state: yup.string().required("State is required"),
    });

    const initialValues: FormValues = {
        id: "",
        firstName: "",
        lastName: "",

        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        address: "",
        city: "",
        postCode: "",
        country: "",
        state: "",
    };

    const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
        formikHelpers.setSubmitting(true);
        
        try {
            // Find country and state IDs/Names from selected values
            const selectedCountry = locationsData.find(c => c.name === values.country);
            const selectedState = selectedCountry?.states.find((s: any) => s.name === values.state);
            
            if (!isAuthenticated) {
                // Register the user
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';
                
                const registerPayload = {
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    password: values.password,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    address: values.address,
                    city: values.city,
                    postCode: values.postCode,
                    country: selectedCountry?.name || values.country,
                    state: selectedState?.name || values.state,
                };

                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerPayload),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                // Store token securely
                const { authStorage } = await import('@/utils/authStorage');
                authStorage.setToken(data.token);
                authStorage.setUserData(data.user);

                // Store user data in Redux
                dispatch(login({
                    id: data.user.id,
                    email: data.user.email,
                    phoneNumber: data.user.phone_number,
                    firstName: data.user.first_name,
                    lastName: data.user.last_name,
                    role: data.user.role || 'customer',
                    token: data.token,
                }));

                const newAddress = {
                    id: data.user.id, // Or address ID if returned? Usually user ID for main address or specific ID. 
                    // Note: If backend register creates an address entry, we might need to fetch it or use what's in user object
                    // In Register.tsx, it just redirects. 
                    // data.user usually contains flat fields for profile address.
                    // Let's assume data.user has the address fields.
                    firstName: data.user.first_name || values.firstName,
                    lastName: data.user.last_name || values.lastName,
                    address: data.user.address || values.address,
                    city: data.user.city || values.city,
                    postCode: data.user.postal_code || values.postCode,
                    country: data.user.country || values.country,
                    state: data.user.state || values.state,
                    email: data.user.email || values.email,
                    is_default: true
                };
                
                // We might need to reload addresses to get the proper ID for the address table
                // But for now, let's try to simulate it or fetch
                // Actually, logic below triggers 'loadAddresses' via useEffect when isAuthenticated changes to true!
                // So we might just need to wait or manually set selectedAdress.
                
                // Let's rely on the useEffect[isAuthenticated] to load addresses?
                // But we want to auto-select this one.
                // The useEffect will run.
                
                setGuestEmail(values.email);
                showSuccessToast("Registration successful! Proceeding...");
                
                // We can't easily wait for useEffect. So let's manually set addressVisible derived from response?
                // The issue is ID. addressApi.getAll returns addresses with IDs. Register returns user.
                // If user model has addresses linked, we need those IDs for order creation.
                // If register creates a row in 'addresses' table, we need that ID.
                // Let's assume we proceed to order creation. Order creation needs 'shippingAddressId'.
                // If we rely on reload, it might be slow.
                // Alternative: just call addressApi.getAll() immediately here with new token.
                
                // Wait, if I am now authenticated, I can create the address via addressApi.create as well?
                // No, register already created it (presumably). Creating duplicates is bad.
                // Let's fetch addresses.
                
                const addresses = await addressApi.getAll(); // Uses new token via interceptor/authStorage
                const mapped = addresses.map((addr: any) => ({
                    id: addr.id,
                    firstName: addr.first_name || addr.firstName,
                    lastName: addr.last_name || addr.lastName,
                    address: addr.address_line || addr.addressLine || addr.address,
                    city: addr.city,
                    postCode: addr.postal_code || addr.postalCode || addr.postCode,
                    country: addr.country_name || addr.country || '',
                    state: addr.state_name || addr.state || '',
                    is_default: addr.is_default || false,
                    email: data.user.email || '',
                }));
                setAddressVisible(mapped);
                if (mapped.length > 0) {
                     setSelectedAddress(mapped[0]);
                     setBillingAddressMethod("use");
                     
                     // Trigger checkout
                    setTimeout(() => {
                        const placeOrderBtn = document.querySelector('.bb-btn-2.place-order-btn') as HTMLElement;
                        if (placeOrderBtn) {
                            placeOrderBtn.click();
                        }
                    }, 500);
                }

            } else {
                // User IS authenticated, create new address
                const addressData = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    addressLine: values.address,
                    city: values.city,
                    postalCode: values.postCode,
                    state: selectedState?.name || values.state,
                    stateName: selectedState?.name || values.state,
                    country: selectedCountry?.name || values.country,
                    countryName: selectedCountry?.name || values.country,
                    isDefault: addressVisible.length === 0, 
                    addressType: 'billing',
                };
                
                setGuestEmail(values.email);

                const createdAddress = await addressApi.create(addressData, false); // Authenticated is true (passed !isAuthenticated which is false)
                // Wait, existing code passed `!isAuthenticated` which was false. So second arg is `isGuest`.
                // Here `isAuthenticated` is true. So pass false.

                 if (!createdAddress) {
                    throw new Error("Failed to create address.");
                }

                const newAddress = {
                    id: createdAddress.id,
                    firstName: createdAddress.first_name || createdAddress.firstName,
                    lastName: createdAddress.last_name || createdAddress.lastName,
                    address: createdAddress.address_line || createdAddress.addressLine || createdAddress.address,
                    city: createdAddress.city,
                    postCode: createdAddress.postal_code || createdAddress.postalCode,
                    country: createdAddress.country_name || createdAddress.country,
                    state: createdAddress.state_name || createdAddress.state,
                    email: values.email,
                };

                const updatedAddresses = [...addressVisible, newAddress];
                setAddressVisible(updatedAddresses);
                setSelectedAddress(newAddress);
                setBillingAddressMethod("use");
                
                showSuccessToast("Address saved successfully!");
                formikHelpers.resetForm();
                
                setStates([]);
                setCities([]);

                setTimeout(() => {
                    const placeOrderBtn = document.querySelector('.bb-btn-2.place-order-btn') as HTMLElement;
                    if (placeOrderBtn) {
                        placeOrderBtn.click();
                    }
                }, 500);
            }

        } catch (error: any) {
            console.error('Error saving/registering:', error);
            showErrorToast(error.message || "An error occurred. Please try again.");
        } finally {
            formikHelpers.setSubmitting(false);
        }
    }

    const UserSchema = yup.object().shape({
        phoneNumber: yup.string()
            .min(10, "Phone number must be at least 10 digits")
            .matches(/^[0-9]+$/, "Phone number must contain only digits")
            .required("Phone Number is required"),
        password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    })

    const initialUserValues: userValues = {
        phoneNumber: "" as string,
        password: "" as string,
    }

    const handleLoginBtn = async (values: userValues, formikHelpers: FormikHelpers<userValues>) => {
        formikHelpers.setSubmitting(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com';
            
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: values.phoneNumber,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid phone number or password');
            }

            // Store token securely in sessionStorage
            const { authStorage } = await import('@/utils/authStorage');
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
            setCheckOutMethod("guest");
            setBillingVisible(true);
            setLoginVisible(false);
        } catch (error: any) {
            console.error('Login error:', error);
            showErrorToast(error.message || 'Login failed. Please try again.');
            formikHelpers.setSubmitting(false);
        }
    }

    return (
        <>
            <section className="section-checkout padding-tb-50">
                <div className="container">
                    <Row className="mb-minus-24">
                        <Col lg={4} sm={12} className="mb-24">
                            <div className="bb-checkout-sidebar">
                                <Fade triggerOnce direction='up' duration={1000} delay={200}>
                                    <div className="checkout-items">
                                        <div className="sub-title">
                                            <h4>summary</h4>
                                        </div>
                                        <div className="checkout-summary">
                                            <ul>
                                                <li><span className="left-item">sub-total</span><span>₹{subTotal.toFixed(2)}</span></li>
                                                <li><span className="left-item">Delivery Charge</span><span>₹{deliveryCharge.toFixed(2)}</span></li>

                                            </ul>
                                            <div className="summary-total">
                                                <ul>
                                                    <li><span className="text-left">Total Amount</span><span className="text-right">₹{total.toFixed(2)}</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="bb-checkout-pro">
                                            {cartSlice.map((data: any, index: any) => (
                                                <div key={index} className="pro-items">
                                                    <div className="image">
                                                        <img src={data.image} alt="new-product-1" />
                                                    </div>
                                                    <div className="items-contact">
                                                        <h4><a onClick={(e) => e.preventDefault()} href="#">{data.title}</a></h4>
                                                        <span className="bb-pro-rating">
                                                            <StarRating rating={data.rating} />
                                                        </span>
                                                        <div className="inner-price">
                                                            <span className="new-price">₹{typeof data.newPrice === 'number' ? data.newPrice.toFixed(2) : data.newPrice}</span>
                                                            <span className="old-price">{data.oldPrice}</span>
                                                        </div>
                                                        <div className="bb-pro-variation">
                                                            <ul>
                                                                {data.attributes && data.attributes.length > 0 ? (
                                                                    data.attributes.map((attr: any, attrIndex: number) => (
                                                                        <li key={attrIndex} className={activeIndex[index] === attrIndex ? "active" : ""}>
                                                                            <a onClick={(e) => { e.preventDefault(); handleClick(index, attrIndex) }} href="#" className="bb-opt-sz"
                                                                                title={attr.attributeValue}>{attr.attributeValue}</a>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    data.weight && (
                                                                        <li>
                                                                            <a href="#" className="bb-opt-sz">{data.weight}</a>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Fade>

                                    <div className="checkout-items" >
                                        <div className="policy-section p-3 bg-light rounded-3" style={{ marginTop: "24px", paddingTop: "20px" }}>
                                            <h5 className="mb-3 font-weight-bold">All India shipping Available</h5>
                                            <ul className="list-unstyled mb-0 m-0 p-0">
                                                <li className="d-flex align-items-start mb-3">
                                                    <i className="ri-checkbox-circle-line me-2 mt-1 text-success fs-5" style={{ minWidth: "24px" }}></i>
                                                    <span className="text-muted" style={{ fontSize: "14px", lineHeight: "1.5" }}>The product will be delivered within 6 working days</span>
                                                </li>
                                                <li className="d-flex align-items-start mb-3">
                                                    <i className="ri-checkbox-circle-line me-2 mt-1 text-success fs-5" style={{ minWidth: "24px" }}></i>
                                                    <span className="text-muted" style={{ fontSize: "14px", lineHeight: "1.5" }}>In case of valid damage claims, they must be reported within 24 Hours of product delivery. At our discretion, we may offer a replacement, which will be delivered within 4–5 working days.</span>
                                                </li>
                                                <li className="d-flex align-items-start">
                                                    <i className="ri-checkbox-circle-line me-2 mt-1 text-success fs-5" style={{ minWidth: "24px" }}></i>
                                                    <span className="text-muted" style={{ fontSize: "14px", lineHeight: "1.5" }}>No returns, No Refunds</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                            </div>
                        </Col>
                        <Col lg={8} sm={12} className="mb-24">
                            <Fade triggerOnce direction='up' duration={1000} delay={400}>
                                <div className="bb-checkout-contact">
                                    <div className="main-title">
                                        <h4>New Customer</h4>
                                    </div>
                                    {!isAuthenticated ? <>
                                        <label className="inner-title">Checkout Options</label>
                                        <div className="checkout-radio">
                                            <div className="radio-itens">
                                                <input onChange={handleCheckOutChange} checked={checkOutMethod === "register"} value='register' type="radio" id="del1" name="account" />
                                                <label htmlFor="del1">Register Account</label>
                                            </div>
                                            <div className="radio-itens">
                                                <input onChange={handleCheckOutChange} checked={checkOutMethod === "login"} value='login' type="radio" id="del3" name="account" />
                                                <label htmlFor="del3">Login Account</label>
                                            </div>
                                        </div>
                                    </>:<></>}
                                    {textVisible && (
                                        <p>By creating an account you will be able to shop faster, be up to date on an orders status,
                                            and keep track of the orders you have previously made.</p>
                                    )}
                                    {btnVisible && (
                                        <div className="inner-button">
                                            <a onClick={handleContinueBtn} className="bb-btn-2">Continue</a>
                                        </div>
                                    )}
                                    {loginVisible && (
                                        <>
                                            <Formik
                                                onSubmit={handleLoginBtn}
                                                validationSchema={UserSchema}
                                                initialValues={initialUserValues}
                                            >{({
                                                handleSubmit,
                                                handleChange,
                                                values,
                                                errors,
                                            }: FormikProps<userValues>) => {
                                                return (
                                                    <Form onSubmit={handleSubmit} method="post">
                                                        <div className="input-item">
                                                            <label>Phone Number</label>
                                                            <Form.Group>
                                                                <InputGroup>
                                                                    <Form.Control onChange={handleChange} value={values.phoneNumber || ""} type="tel" id="phoneNumber" name="phoneNumber" placeholder="Enter Your Phone Number" isInvalid={!!errors.phoneNumber} />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.phoneNumber}
                                                                    </Form.Control.Feedback>
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="input-item">
                                                            <label>Password</label>
                                                            <Form.Group>
                                                                <InputGroup>
                                                                    <Form.Control value={values.password || ""} onChange={handleChange} type="password" name="password" placeholder="Enter your password" isInvalid={!!errors.password} />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.password}
                                                                    </Form.Control.Feedback>
                                                                </InputGroup>
                                                            </Form.Group>
                                                        </div>

                                                        <div className="input-button">
                                                            <div>
                                                                <button type="submit" className="bb-btn-2">Login</button>
                                                            </div>
                                                        </div>
                                                    </Form>
                                                )
                                            }}
                                            </Formik>
                                        </>
                                    )}
                                    {billingVisible && (
                                        <>
                                            <div className="main-title">
                                                <h4>Billing Details</h4>
                                            </div>
                                            <div className="checkout-radio">
                                                <div className="radio-itens">
                                                    <input disabled={addressVisible.length === 0} onChange={handleBillingAddressChange} checked={billingAddressMethod === "use"} value="use" type="radio" id="address1" name="address" />
                                                    <label htmlFor="address1">I want to use an existing address</label>
                                                </div>
                                                <div className="radio-itens">
                                                    <input onChange={handleBillingAddressChange} checked={billingAddressMethod === "new" || addressVisible.length === 0} value="new" type="radio" id="address2" name="address" />
                                                    <label htmlFor="address2">I want to use new address</label>
                                                </div>
                                            </div>
                                            <div className="input-box-form">
                                                {billingAddressMethod === "new" || addressVisible.length === 0 ? (
                                                    <Formik
                                                        validationSchema={schema}
                                                        onSubmit={handleSubmit}
                                                        initialValues={initialValues}

                                                    >{({
                                                        handleSubmit,
                                                        handleChange,
                                                        setFieldValue,
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
                                                            setStates(countryData ? countryData.states : []);
                                                            setCities([]);
                                                        };

                                                        // Handle State Change
                                                        const handleStateChange = (e: React.ChangeEvent<any>) => {
                                                            const selectedState = e.target.value;
                                                            handleChange(e);
                                                            setFieldValue('city', ''); // Reset city
                                                            
                                                            const stateData = states.find(s => s.name === selectedState);
                                                            setCities(stateData ? stateData.cities : []);
                                                            
                                                            // Calculate delivery charge dynamically
                                                            setCurrentDataForDelivery(selectedState);
                                                        };

                                                        return (
                                                            <Form onSubmit={handleSubmit} method="post">
                                                                <Row>
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>First Name *</label>
                                                                            <InputGroup>
                                                                                <Form.Control onChange={handleChange} value={values.firstName} isInvalid={!!errors.firstName} type="text" name="firstName" placeholder="Enter your First Name" />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.firstName}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Last Name</label>
                                                                            <InputGroup>
                                                                                <Form.Control onChange={handleChange} value={values.lastName} isInvalid={!!errors.lastName} type="text" name="lastName" placeholder="Enter your Last Name" />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.lastName}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Email *</label>
                                                                            <InputGroup>
                                                                                <Form.Control onChange={handleChange} value={values.email} isInvalid={!!errors.email} type="email" name="email" placeholder="Enter your Email" />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.email}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Address *</label>
                                                                            <InputGroup>
                                                                                <Form.Control onChange={handleChange} value={values.address} isInvalid={!!errors.address} type="text" name="address" placeholder="Address Line 1" />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.address}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    {!isAuthenticated && (
                                                                        <>
                                                                            <Col sm={12}>
                                                                                <Form.Group className="input-item">
                                                                                    <label>Phone Number *</label>
                                                                                    <InputGroup>
                                                                                        <Form.Control onChange={handleChange} value={values.phoneNumber || ""} isInvalid={!!errors.phoneNumber} type="tel" name="phoneNumber" placeholder="Enter your Phone Number" />
                                                                                        <Form.Control.Feedback type="invalid">
                                                                                            {errors.phoneNumber}
                                                                                        </Form.Control.Feedback>
                                                                                    </InputGroup>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col lg={6} sm={12}>
                                                                                <Form.Group className="input-item">
                                                                                    <label>Password *</label>
                                                                                    <InputGroup>
                                                                                        <Form.Control onChange={handleChange} value={values.password || ""} isInvalid={!!errors.password} type="password" name="password" placeholder="Password" />
                                                                                        <Form.Control.Feedback type="invalid">
                                                                                            {errors.password}
                                                                                        </Form.Control.Feedback>
                                                                                    </InputGroup>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col lg={6} sm={12}>
                                                                                <Form.Group className="input-item">
                                                                                    <label>Confirm Password *</label>
                                                                                    <InputGroup>
                                                                                        <Form.Control onChange={handleChange} value={values.confirmPassword || ""} isInvalid={!!errors.confirmPassword} type="password" name="confirmPassword" placeholder="Confirm Password" />
                                                                                        <Form.Control.Feedback type="invalid">
                                                                                            {errors.confirmPassword}
                                                                                        </Form.Control.Feedback>
                                                                                    </InputGroup>
                                                                                </Form.Group>
                                                                            </Col>
                                                                        </>
                                                                    )}
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Country *</label>
                                                                            <InputGroup>
                                                                                <Form.Select 
                                                                                    onChange={handleCountryChange} 
                                                                                    value={values.country} 
                                                                                    isInvalid={!!errors.country} 
                                                                                    name='country' 
                                                                                    className="custom-select">
                                                                                    <option value='' disabled>Select Country</option>
                                                                                    {countries.map((country, index) => (
                                                                                        <option key={index} value={country.name}>
                                                                                            {country.name}
                                                                                        </option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.country}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Region State *</label>
                                                                            <InputGroup>
                                                                                <Form.Select 
                                                                                    onChange={handleStateChange} 
                                                                                    value={values.state} 
                                                                                    isInvalid={!!errors.state} 
                                                                                    name='state' 
                                                                                    className="custom-select"
                                                                                    disabled={!values.country}>
                                                                                    <option value='' disabled>Select State</option>
                                                                                    {states.map((state, index) => (
                                                                                        <option key={index} value={state.name}>
                                                                                            {state.name}
                                                                                        </option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.state}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>City *</label>
                                                                            <InputGroup>
                                                                                <Form.Select 
                                                                                    onChange={handleChange} 
                                                                                    value={values.city} 
                                                                                    isInvalid={!!errors.city} 
                                                                                    name='city' 
                                                                                    className="custom-select"
                                                                                    disabled={!values.state}>
                                                                                    <option value='' disabled>Select City</option>
                                                                                    {cities.map((city, index) => (
                                                                                        <option key={index} value={city}>
                                                                                            {city}
                                                                                        </option>
                                                                                    ))}
                                                                                </Form.Select>
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.city}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col lg={6} sm={12}>
                                                                        <Form.Group className="input-item">
                                                                            <label>Post Code *</label>
                                                                            <InputGroup>
                                                                                <Form.Control onChange={handleChange} value={values.postCode} isInvalid={!!errors.postCode} type="text" name="postCode" placeholder="Post Code" />
                                                                                <Form.Control.Feedback type="invalid">
                                                                                    {errors.postCode}
                                                                                </Form.Control.Feedback>
                                                                            </InputGroup>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col sm={12}>
                                                                        <div className="input-button">
                                                                            <button type="submit" className="bb-btn-2">Add</button>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </Form>
                                                        )
                                                    }}
                                                    </Formik>
                                                ) : (
                                                    <>
                                                        {billingAddressMethod === "use" &&
                                                            addressVisible.length > 0 && (
                                                                <>
                                                                    {addressVisible.map((address, index) => (
                                                                        <div key={address.id} style={{ marginTop: "24px" }} className="bb-inner-tabs">
                                                                            <div style={{ display: "flex", justifyContent: "space-between", margin: "0 10px", cursor: "pointer" }} className="information" onClick={() => handleSelectAddress(address)}>
                                                                                <div className="bb-sidebar-block-item">
                                                                                    <input onChange={() => handleSelectAddress(address)}
                                                                                        checked={selectedAddress !== null && selectedAddress.id === address.id}
                                                                                        name="selectedAddress"
                                                                                        type="checkbox" />
                                                                                    <span className="checked"></span>
                                                                                </div>
                                                                                <div className='address-box'>
                                                                                    <ul>
                                                                                        <li><span>Name</span> {address.firstName} {address.lastName}</li>
                                                                                        <li><span>Address</span>{address.address}</li>
                                                                                        <li><span>PostCode</span> {address.postCode}</li>
                                                                                    </ul>
                                                                                    <ul>
                                                                                        <li><span>City</span>{address.city}</li>
                                                                                        <li><span>State</span>{address.state}</li>
                                                                                        <li><span>Country</span> {address.country}</li>
                                                                                    </ul>
                                                                                </div>
                                                                                <div >
                                                                                    <a className="cart-remove-item"><i onClick={() => handleRemoveAddress(address.id)} className="ri-close-line"></i></a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ marginTop: "24px" }} className="col-12">
                                                                        <div className="about-order">
                                                                            <h5>Add Comments About Your Order</h5>
                                                                            <textarea name="your-commemt" placeholder="Comments" className="w-100 p-2 border rounded" rows={3}></textarea>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ marginTop: "24px" }} className="col-12">
                                                                        <div className="input-button">
                                                                            <button 
                                                                                onClick={handleCheckout} 
                                                                                type="button" 
                                                                                className="bb-btn-2 place-order-btn"
                                                                                disabled={isCreatingOrder}
                                                                            >
                                                                                {isCreatingOrder ? 'Placing Order...' : 'Place Order'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Fade>
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}

export default Checkout