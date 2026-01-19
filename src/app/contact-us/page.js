"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Contact from '@/components/pages-section/contact-us/Contact'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Contact Us"} />
      <Contact />
    </>
  )
}

export default page
