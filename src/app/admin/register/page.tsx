"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import AdminRegister from '@/components/login/AdminRegister'

const AdminRegisterPage = () => {
  return (
    <>
      <Breadcrumb title={"Admin Register"} />
      <AdminRegister />
    </>
  )
}

export default AdminRegisterPage
