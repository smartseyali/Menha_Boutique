
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { authStorage } from "../../utils/authStorage";
import Loader from "../loader/Loader";
import Toastify from "../toast-popup/Toastify";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user from storage
    const userData = authStorage.getUserData();
    setUser(userData);
    
    // Immediately hide loading - no artificial delay
    setLoading(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authStorage.clear();
    navigate('/login');
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
              <Link to="/" className="admin-logo me-4 text-decoration-none">
                <h4 className="mb-0 text-dark">Menha Boutique Admin</h4>
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
