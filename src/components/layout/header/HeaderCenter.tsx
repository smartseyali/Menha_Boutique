import SidebarCart from '@/components/cart/SidebarCart';
import MobileMenu from '@/components/menu/MobileMenu';
import { RootState } from '@/store';
import { login, logout, setUserData } from '@/store/reducer/loginSlice';
import Tools from '@/tools/Tools';
import { useRouter } from 'next/navigation';
import { setCartOpen } from '@/store/reducer/cartSlice';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, setSelectedCategory } from "../../../store/reducer/filterReducer"
import { Row } from 'react-bootstrap';
import CategoryPopup from '@/components/category-popup/CategoryPopup';
import Link from 'next/link';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';
import useSWR from 'swr';
import fetcher from '@/components/fetcher/Fetcher';
import { authStorage } from '@/utils/authStorage';
import BottomNav from '../BottomNav';

const HeaderCenter = ({ wishlistItem, cartSlice }: any) => {
    const isCartOpen = useSelector((state: RootState) => state.cart.isCartOpen);
    const { searchTerm, selectedCategory } = useSelector((state: RootState) => state.filter)
    const [searchInput, setSearchInput] = useState(searchTerm || "");
    const dispatch = useDispatch()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMainMenu, setActiveMainMenu] = useState<string | null>(null);
    const isAuthenticated = useSelector((state: RootState) => state.login.isAuthenticated);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>('All Categories');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    // Fetch categories from API
    const { data: categoriesData, error: categoriesError } = useSWR("/api/category", fetcher);
    const categories = categoriesData || [];



    // Load user data from sessionStorage on mount
    useEffect(() => {
        const userData = authStorage.getUserData();
        const token = authStorage.getToken();
        if (userData && token) {
            dispatch(setUserData({
                isAuthenticated: true,
                user: { ...userData, token },
            }));
        }
    }, [dispatch]);

    const handleMenuClick = (info: any) => {
        const categoryName = info.key;
        setSelectedItem(categoryName === 'all' ? 'All Categories' : categoryName);
        setVisible(false);
        
        // Update selected category in Redux
        if (categoryName === 'all') {
            dispatch(setSelectedCategory([]));
            router.push("/category");
        } else {
            // dispatch(setSelectedCategory([categoryName]));
             router.push(`/category/${categoryName}`);
        }
        
        // Clear search term to ensure we see all products in the selected category
        dispatch(setSearchTerm(""));
        setSearchInput("");
    };

    const handleVisibleChange = (flag: boolean) => {
        setVisible(flag);
    };

    const handleSearch = (event: any) => {
        const value = event.target.value;
        setSearchInput(value);
        // Update search term in Redux as user types (optional - can be removed if you only want to search on submit)
        // dispatch(setSearchTerm(value));
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        // dispatch(setSearchTerm(searchInput));
        setIsSearchOpen(false);
        if (searchInput.trim()) {
            router.push(`/search/${searchInput}`);
        } else {
             router.push("/shop-full-width-col-4");
        }
        setSearchInput("");
    };
    
    // Sync search input with Redux state when it changes externally
    useEffect(() => {
        setSearchInput(searchTerm || "");
    }, [searchTerm]);
    
    // Update selected item display when category changes
    useEffect(() => {
        if (selectedCategory && selectedCategory.length > 0) {
            setSelectedItem(selectedCategory[0]);
        } else {
            setSelectedItem('All Categories');
        }
    }, [selectedCategory]);

    const openCart = () => {
        dispatch(setCartOpen(true));
    };

    const closeCart = () => {
        dispatch(setCartOpen(false));
    };

    const openMobileManu = () => {
        setIsMobileMenuOpen((prev: any) => !prev);
    }

    const closeMobileManu = () => {
        setIsMobileMenuOpen(false)
    }

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleLogout = () => {
        authStorage.clear();
        dispatch(logout());
        router.push("/");
    };

    const toggleMainMenu = (menuKey: any) => {
        setActiveMainMenu((prevMenu) => (prevMenu === menuKey ? null : menuKey));
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    const openCategoryPopup = () => {
        setIsPopupOpen(true);
    };

    const closeCategoryPopup = () => {
        setIsPopupOpen(false);
    };

    const menu = (
        <Menu className='select-options' style={{display: "block", top: "-5px", borderRadius: "10px", maxHeight: "300px", overflowY: "auto"}} onClick={handleMenuClick}>
            <MenuItem key="all">All Categories</MenuItem>
            {categories.map((cat: any) => (
                <MenuItem key={cat.category || cat.name} style={{padding: "8px 16px"}}>
                    {cat.category || cat.name}
                </MenuItem>
            ))}
        </Menu>
    );

    return (
        <>
            <div className="bottom-header" style={{ padding: '10px 0' }}>
                <div className="container-fluid">
                    <Row>
                        <div className='col-12'>
                            <div className="inner-bottom-header d-flex align-items-center position-relative w-100 flex-nowrap" style={{ minHeight: '50px', flexDirection: 'row' }}>
                                
                                {/* Mobile Menu Icon - Left (Hidden as it's in bottom nav) */}
                                {/* Mobile Menu Icon - Left (Visible on mobile) */}
                                <div className="d-xl-none cursor-pointer me-3" onClick={openMobileManu}>
                                    <i className="ri-menu-2-line fs-3 text-dark"></i>
                                </div>

                                {/* Left: Logo (Desktop) */}
                                <div className="header-logo me-3 d-none d-xl-block" style={{ height: '60px' }}>
                                    <Link href="/">
                                        <img 
                                            src="/assets/img/logo/logo.gif" 
                                            alt="Pattikadai" 
                                            className="light"
                                            style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                                        />
                                        <img 
                                            src="/assets/img/logo/logo.gif" 
                                            alt="Pattikadai" 
                                            className="dark"
                                            style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                                        />
                                    </Link>
                                </div>

                                {/* Center: Logo (Mobile) */}
                                <div className="header-logo d-block d-xl-none position-absolute top-50 start-50 translate-middle" style={{ height: '60px' }}>
                                    <Link href="/">
                                        <img 
                                            src="/assets/img/logo/logo.gif" 
                                            alt="Pattikadai" 
                                            className="light"
                                            style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                                        />
                                        <img 
                                            src="/assets/img/logo/logo.gif" 
                                            alt="Pattikadai" 
                                            className="dark"
                                            style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }}
                                        />
                                    </Link>
                                </div>

                                {/* Center: Navigation Menu */}
                                <div className="main-menu d-none d-xl-flex align-items-center gap-4 position-absolute top-50 start-50 translate-middle">
                                    <Link href="/" className="menu-item d-flex align-items-center gap-2 text-dark text-decoration-none">
                                        <i className="ri-home-line fs-5"></i>
                                        <span className="fw-medium">Home</span>
                                    </Link>
                                    <Dropdown
                                        trigger={['click']}
                                        overlay={menu}
                                        animation="slide-up"
                                        onVisibleChange={handleVisibleChange}
                                        visible={visible}
                                    >
                                        <div className="menu-item text-dark text-decoration-none cursor-pointer d-flex align-items-center gap-1">
                                            <span className="fw-medium">All categories</span>
                                            <i className="ri-arrow-down-s-line"></i>
                                        </div>
                                    </Dropdown>
                                    <Link href="/bestselling" className="menu-item d-flex align-items-center gap-2 text-dark text-decoration-none position-relative">
                                        <i className="ri-fire-line fs-5"></i>
                                        <span className="fw-medium">Best selling</span>
                                        <span className="badge bg-danger position-absolute" style={{ top: '-12px', right: '-25px', fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>HOT</span>
                                    </Link>
                                    <Link href="/specials" className="menu-item d-flex align-items-center gap-2 text-dark text-decoration-none position-relative">
                                        <i className="ri-heart-line fs-5"></i>
                                        <span className="fw-medium">Pattikadai Special</span>
                                        <span className="badge bg-success position-absolute" style={{ top: '-12px', right: '-25px', fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>BEST</span>
                                    </Link>
                                    <Link href="/combos" className="menu-item text-dark text-decoration-none position-relative">
                                        <span className="fw-medium">Special Combo</span>
                                        <span className="badge bg-danger position-absolute" style={{ top: '-12px', right: '-30px', fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>Offers</span>
                                    </Link>

                                </div>

                                {/* Right: Icons */}
                                                                  
                                <div className="header-icons d-flex align-items-center gap-2 gap-xl-4 ms-auto">
                                    <div className="search-icon cursor-pointer" onClick={toggleSearch}>
                                        <i className="ri-search-line fs-4 text-dark"></i>
                                    </div>
                                    <Link onClick={openCart} href="#" className="cart-icon position-relative text-dark d-none d-xl-block">
                                        <i className="ri-shopping-bag-line fs-4"></i>
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-black text-white" style={{ fontSize: '10px', padding: '3px 5px', border: '1px solid #fff' }}>
                                            {cartSlice.length}
                                        </span>
                                    </Link>
                                    <Link href={isAuthenticated ? "/user-profile" : "/login"} className="user-icon text-dark d-none d-xl-block">
                                        <i className="ri-user-line fs-4"></i>
                                    </Link>
                                    <Link href="/wishlist" className="wishlist-icon position-relative text-dark">
                                        <i className="ri-heart-line fs-4"></i>
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-black text-white" style={{ fontSize: '10px', padding: '3px 5px', border: '1px solid #fff' }}>
                                            {wishlistItem.length}
                                        </span>
                                    </Link>
                                    
                                </div>

                                {isSearchOpen && (
                                    <div className="position-absolute start-0 w-100 bg-white p-3 shadow-sm border-top" style={{ top: '100%', zIndex: 1000 }}>
                                        <form onSubmit={handleSubmit} className="d-flex align-items-center gap-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search for products..."
                                                value={searchInput}
                                                onChange={handleSearch}
                                                autoFocus
                                            />
                                            <button type="submit" className="btn btn-dark">
                                                <i className="ri-search-line"></i>
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Row>
                </div>
            </div>
            <SidebarCart isCartOpen={isCartOpen} closeCart={closeCart} />
            <MobileMenu activeMainMenu={activeMainMenu} toggleMainMenu={toggleMainMenu} isMobileMenuOpen={isMobileMenuOpen} closeMobileManu={closeMobileManu} />
            <BottomNav 
                openMobileManu={openMobileManu} 
                openCart={openCart} 
                wishlistCount={wishlistItem.length} 
                cartCount={cartSlice.length} 
                isAuthenticated={isAuthenticated} 
            />
            {/* <Tools /> */}
            <CategoryPopup isPopupOpen={isPopupOpen} closeCategoryPopup={closeCategoryPopup} />
        </>
    )
}

export default HeaderCenter;
