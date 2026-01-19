"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Register from '@/components/login/Register'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Register"} />
      <Register />
    </>
  )
}

export default page
