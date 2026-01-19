"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import UserProfile from '@/components/user-profile/UserProfile'


const page = () => {
  return (
    <>
      <Breadcrumb title={"User Profile"} />
      <UserProfile />
    </>
  )
}

export default page
