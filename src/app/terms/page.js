"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import TermsAndConditions from '@/components/terms-conditions/TermsAndConditions'
import Faq from '@/components/faq/Faq'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Terms & Conditions"} />
      <TermsAndConditions />
      <Faq />
    </>
  )
}

export default page
