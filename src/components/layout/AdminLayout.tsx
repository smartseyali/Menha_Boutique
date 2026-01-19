"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/reducer/loginSlice";
import { authStorage } from "@/utils/authStorage";
import Loader from "../loader/Loader";
import Toastify from "../toast-popup/Toastify";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "react-bootstrap";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.login.user);

  useEffect(() => {
    // Immediately hide loading - no artificial delay
    setLoading(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    // Clear auth data from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    }
    router.push('/');
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'Admin';

  return (
    <div className="admin-layout-wrapper">
      <Toastify />
      {loading && <Loader />}
      
      {/* Admin Header/Navbar */}
      <header className="bb-admin-layout-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <Link href="/admin" className="admin-logo me-4">
                <h4 className="mb-0">Menha Boutique Admin</h4>
              </Link>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="admin-user-info">
                <i className="ri-user-line me-2"></i>
                {displayName}
              </span>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                <i className="ri-logout-box-line me-1"></i>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="admin-layout-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

