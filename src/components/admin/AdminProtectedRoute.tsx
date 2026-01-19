"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUserData } from '@/store/reducer/loginSlice';
import { authStorage } from '@/utils/authStorage';
import { authApi } from '@/utils/authApi';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
  const user = useSelector((state: RootState) => state.login.user);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Check if user has token
      if (!authStorage.isAuthenticated()) {
        router.push('/login');
        setIsChecking(false);
        return;
      }

      try {
        // Refresh user data from backend to get latest role
        const backendUser = await authApi.getCurrentUser();
        
        // Update auth storage and Redux with latest user data
        authStorage.setUserData(backendUser);
        dispatch(setUserData({
          isAuthenticated: true,
          user: {
            id: backendUser.id,
            email: backendUser.email,
            phoneNumber: backendUser.phone_number || backendUser.phoneNumber,
            firstName: backendUser.first_name || backendUser.firstName,
            lastName: backendUser.last_name || backendUser.lastName,
            role: backendUser.role,
            token: authStorage.getToken() || '',
          }
        }));

        // Check if user has admin role
        if (backendUser.role !== 'admin') {
          console.error('User does not have admin role. Current role:', backendUser.role);
          router.push('/');
          setIsChecking(false);
          return;
        }

        setIsChecking(false);
      } catch (error: any) {
        console.error('Error checking admin access:', error);
        // If API call fails, check local storage as fallback
        const localUserData = authStorage.getUserData();
        const localRole = localUserData?.role;

        if (localRole !== 'admin') {
          router.push('/');
          setIsChecking(false);
          return;
        }

        // If local data says admin but API failed, still allow access
        // (might be network issue)
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [router, dispatch]);

  // Show nothing while checking
  if (isChecking) {
    return null;
  }

  // Final check before rendering
  const authStatus = isAuthenticated || authStorage.isAuthenticated();
  const userRole = user?.role || authStorage.getUserData()?.role;

  if (!authStatus || userRole !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;

