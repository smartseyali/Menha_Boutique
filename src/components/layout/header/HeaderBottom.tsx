import CategoryPopup from '@/components/category-popup/CategoryPopup';
import banner from '@/utility/header/benner';
import blog from '@/utility/header/blog';
import classic from '@/utility/header/classic';
import column from '@/utility/header/columns';
import list from '@/utility/header/list';
import pages from '@/utility/header/pages';
import productpage from '@/utility/header/productpage';
import Link from 'next/link';
import React, { useState } from 'react'
import { Row } from 'react-bootstrap';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem } from 'rc-menu';
import 'rc-dropdown/assets/index.css';

const HeaderBottom = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>('Surat');
    const svgProps: React.SVGProps<SVGSVGElement> = {
        enableBackground: "new 0 0 512 512",
        xmlns: "http://www.w3.org/2000/svg",
    };

    const handleMenuClick = (info: any) => {
        setSelectedItem(`${info.key}`);
        setVisible(false);
    };

    const handleVisibleChange = (flag: boolean) => {
        setVisible(flag);
    };

    const openCategoryPopup = () => {
        setIsPopupOpen(true);
    };

    const closeCategoryPopup = () => {
        setIsPopupOpen(false);
    };

    const menu = (
        <Menu className='select-options bb-dropdown-location' style={{ display: "block", right: "-91px", top: "5px", borderRadius: "10px" }} onClick={handleMenuClick}>
            <MenuItem key="Surat">Surat</MenuItem>
            <MenuItem key="Delhi">Delhi</MenuItem>
            <MenuItem key="Rajkot">Rajkot</MenuItem>
            <MenuItem key="Udaipur">Udaipur</MenuItem>
        </Menu>
    );

    return (
        <>
            <CategoryPopup isPopupOpen={isPopupOpen} closeCategoryPopup={closeCategoryPopup} />
        </>
    )
}

export default HeaderBottom
