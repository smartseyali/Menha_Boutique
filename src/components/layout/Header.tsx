"use client"
import React from 'react'
import HeaderTop from './header/HeaderTop'
import HeaderCenter from './header/HeaderCenter'
import HeaderBottom from './header/HeaderBottom'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import NewsletterModal from '../modal/NewsletterModal'

const Header = () => {
  const wishlistItem = useSelector((state: RootState) => state.wishlist?.wishlist);
  const cartSlice = useSelector((state: RootState) => state.cart?.items);

  return (
    <header className="bb-header mobile-fixed-header">
      <style jsx global>{`
        @media (max-width: 1199px) {
          .mobile-fixed-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
        }
        @media (min-width: 1200px) {
          .bb-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
        }
      `}</style>
      <HeaderTop />
      <HeaderCenter wishlistItem={wishlistItem} cartSlice={cartSlice} />
      <HeaderBottom />
    </header>
  )
}

export default Header
