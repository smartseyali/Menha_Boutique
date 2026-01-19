
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../../utils/authStorage';
import { authApi } from '../../utils/authApi';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Check if user has token
      if (!authStorage.isAuthenticated()) {
        navigate('/login');
        setIsChecking(false);
        return;
      }

      try {
        // Refresh user data from backend to get latest role
        const backendUser = await authApi.getCurrentUser();
        
        // Update auth storage with latest user data
        authStorage.setUserData(backendUser);

        // Check if user has admin role
        if (backendUser.role !== 'admin' && backendUser.role !== 'superadmin') {
          console.error('User does not have admin role. Current role:', backendUser.role);
          navigate('/login'); // Or unauthorized page
          authStorage.clear(); // Force logout if not admin
          setIsChecking(false);
          return;
        }

        setIsChecking(false);
      } catch (error: any) {
        console.error('Error checking admin access:', error);
        // If API call fails, check local storage as fallback
        const localUserData = authStorage.getUserData();
        const localRole = localUserData?.role;

        if (localRole !== 'admin' && localRole !== 'superadmin') {
          navigate('/login');
          setIsChecking(false);
          return;
        }

        // If local data says admin but API failed, still allow access
        // (might be network issue)
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [navigate]);

  // Show nothing while checking (or a spinner)
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
