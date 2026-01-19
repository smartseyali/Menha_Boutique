"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import PrivacyPolicy from '@/components/privacy-policy/PrivacyPolicy'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Privacy Policy"} />
      <PrivacyPolicy />
    </>
  )
}

export default page
