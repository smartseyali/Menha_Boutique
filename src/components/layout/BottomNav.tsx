import Link from 'next/link';
import React from 'react';

interface BottomNavProps {
    openMobileManu: () => void;
    openCart: () => void;
    wishlistCount: number;
    cartCount: number;
    isAuthenticated: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({
    openMobileManu,
    openCart,
    wishlistCount,
    cartCount,
    isAuthenticated
}) => {
    return (
        <div className="fixed-bottom bg-white border-top d-xl-none" style={{ zIndex: 1000 }}>
            <div className="d-flex justify-content-around align-items-center py-2">
                {/* Menu */}
                {/* Home */}
                <Link href="/" className="text-center text-decoration-none">
                    <div className="position-relative d-inline-block">
                        <i className="ri-home-line fs-4 text-dark"></i>
                    </div>
                    <div className="small text-dark" style={{ fontSize: '10px' }}>Home</div>
                </Link>

                {/* Login/Profile */}
                <Link href={isAuthenticated ? "/user-profile" : "/login"} className="text-center text-decoration-none">
                    <div className="position-relative d-inline-block">
                        <i className="ri-user-line fs-4 text-dark"></i>
                    </div>
                    <div className="small text-dark" style={{ fontSize: '10px' }}>{isAuthenticated ? 'Profile' : 'Login'}</div>
                </Link>

                {/* Cart */}
                <div className="text-center cursor-pointer" onClick={openCart}>
                    <div className="position-relative d-inline-block">
                        <i className="ri-shopping-bag-line fs-4 text-dark"></i>
                        {cartCount > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '8px', padding: '2px 4px' }}>
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <div className="small text-dark" style={{ fontSize: '10px' }}>Cart</div>
                </div>


            </div>
        </div>
    );
};

export default BottomNav;
