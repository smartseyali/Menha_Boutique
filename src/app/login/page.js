"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import Login from '@/components/login/Login'

const page = () => {
  return (
    <>
      <Breadcrumb title={"Login"} />
      <Login />
    </>
  )
}

export default page
