/**
 * User Data Utility Functions
 * Compatibility layer for components that previously used getRegistrationData/setRegistrationData
 * Now uses Redux store and authStorage instead of localStorage
 */

import { authStorage } from './authStorage';

export interface RegistrationData {
    uid?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: string;
    city?: string;
    postCode?: string;
    country?: string;
    state?: string;
    profilePhoto?: string;
    description?: string;
    shippingAddress?: string;
}

/**
 * Get user registration data from authStorage
 * Returns an array format for compatibility with old code
 */
export function getRegistrationData(): RegistrationData[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const userData = authStorage.getUserData();
        if (!userData) {
            return [];
        }

        // Convert userData to RegistrationData format
        const registrationData: RegistrationData = {
            uid: userData.id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            city: userData.city || '',
            postCode: userData.postCode || '',
            country: userData.country || '',
            state: userData.state || '',
            profilePhoto: userData.profilePhoto || '',
            description: userData.description || '',
            shippingAddress: userData.shippingAddress || '',
        };

        // Return as array for compatibility
        return [registrationData];
    } catch (error) {
        console.error('Error getting registration data:', error);
        return [];
    }
}

/**
 * Set user registration data
 * Updates authStorage with new user data
 */
export function setRegistrationData(data: RegistrationData[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        if (data && data.length > 0) {
            const userData = data[data.length - 1]; // Get the last item
            // Update authStorage with new data
            const currentUserData = authStorage.getUserData() || {};
            const updatedUserData = {
                ...currentUserData,
                ...userData,
                // Map RegistrationData fields to authStorage format
                id: userData.uid || currentUserData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                address: userData.address,
                city: userData.city,
                postCode: userData.postCode,
                country: userData.country,
                state: userData.state,
                profilePhoto: userData.profilePhoto,
                description: userData.description,
                shippingAddress: userData.shippingAddress,
            };
            authStorage.setUserData(updatedUserData);
        }
    } catch (error) {
        console.error('Error setting registration data:', error);
    }
}

/**
 * Get single user data (convenience function)
 */
export function getUserData(): RegistrationData | null {
    const data = getRegistrationData();
    return data.length > 0 ? data[0] : null;
}

