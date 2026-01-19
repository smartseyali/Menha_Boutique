import banner from '@/utility/header/benner'
import blog from '@/utility/header/blog'
import classic from '@/utility/header/classic'
import column from '@/utility/header/columns'
import list from '@/utility/header/list'
import pages from '@/utility/header/pages'
import Link from 'next/link'
import React, { useState } from 'react'
import Collapse from 'react-bootstrap/Collapse';
import useSWR from 'swr';
import fetcher from '@/components/fetcher/Fetcher';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setSearchTerm, setSelectedCategory } from '../../store/reducer/filterReducer';

const MobileMenu = ({
    isMobileMenuOpen,
    closeMobileManu,
    toggleMainMenu,
    activeMainMenu,
}: any) => {
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const dispatch = useDispatch();
    const router = useRouter();

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = useSWR("/api/category", fetcher);
    const categories = categoriesData || [];

    const handleCategoryClick = (categoryName: string) => {
        closeMobileManu();
        if (categoryName === 'all') {
            dispatch(setSelectedCategory([]));
            router.push("/category");
        } else {
            router.push(`/category/${categoryName}`);
        }
        dispatch(setSearchTerm(""));
    };

    const toggleSubMenu = (submenu: string) => {
        setActiveSubMenu((prevSubMenu) => (prevSubMenu === submenu ? null : submenu));
    };

    return (
        <>
            <div style={{ display: isMobileMenuOpen ? "block" : "none" }} onClick={closeMobileManu} className="bb-mobile-menu-overlay"></div>
            <div id="bb-mobile-menu" className={`bb-mobile-menu ${isMobileMenuOpen ? "bb-menu-open" : ""}`}>
                <div className="bb-menu-title">
                    <span className="menu_title">My Menu</span>
                    <button onClick={closeMobileManu} type="button" className="bb-close-menu">×</button>
                </div>
                <div className="bb-menu-inner">
                    <div className="bb-menu-content">
                        <ul>
                            <li>
                                <Link href="/" onClick={closeMobileManu} className="d-flex align-items-center gap-2">
                                    <i className="ri-home-line fs-5"></i>
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="d-flex align-items-center justify-content-between" 
                                    onClick={(e) => { e.preventDefault(); toggleMainMenu('categories'); }}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <span>All categories</span>
                                    </span>
                                    <i className={`ri-arrow-${activeMainMenu === 'categories' ? 'up' : 'down'}-s-line`}></i>
                                </a>
                                <Collapse in={activeMainMenu === 'categories'}>
                                    <div>
                                        <ul className="sub-menu" style={{ display: 'block' }}>
                                            <li>
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick('all'); }}>All Categories</a>
                                            </li>
                                            {categories.map((cat: any) => (
                                                <li key={cat.category || cat.name}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(cat.category || cat.name); }}>
                                                        {cat.category || cat.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Collapse>
                            </li>
                            <li>
                                <Link href="/bestselling" onClick={closeMobileManu} className="d-flex align-items-center gap-2 position-relative">
                                    <i className="ri-fire-line fs-5"></i>
                                    <span>Best selling</span>
                                    <span className="badge bg-danger ms-2" style={{ fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>HOT</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/specials" onClick={closeMobileManu} className="d-flex align-items-center gap-2 position-relative">
                                    <i className="ri-heart-line fs-5"></i>
                                    <span>Pattikadai Special</span>
                                    <span className="badge bg-success ms-2" style={{ fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>BEST</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/combos" onClick={closeMobileManu} className="d-flex align-items-center gap-2 position-relative">
                                    <span>Special Combo</span>
                                    <span className="badge bg-danger ms-2" style={{ fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>Offers</span>
                                </Link>
                            </li>

                        </ul>
                    </div>
                    <div className="header-res-lan-curr">
                        {/* <!-- Social Start --> */}
                        <div className="header-res-social">
                            <div className="header-top-social">
                                <ul className="mb-0">
                                    <li className="list-inline-item">
                                        <Link href="https://www.facebook.com/share/19riyqAvB9/?mibextid=wwXIfr"><i className="ri-facebook-fill"></i></Link>
                                    </li>
                                    <li className="list-inline-item">
                                        <Link href="https://www.instagram.com/countryfoodcooking?igsh=bDNod2JyM2x6OTk1"><i className="ri-instagram-line"></i></Link>
                                    </li>
                                    <li className="list-inline-item">
                                        <Link href="https://youtube.com/@countryfoodcooking2613?si=mj0BeUdac_IQElB3"><i className="ri-youtube-fill"></i></Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* <!-- Social End --> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MobileMenu
