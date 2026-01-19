"use client"
import React from 'react'
import Breadcrumb from '@/components/breadcrumb/Breadcrumb'
import ProfileEdit from '@/components/user-profile/profile-edit/ProfileEdit'


const page = () => {
  return (
    <>
      <Breadcrumb title={"Profile Edit"} />
      <ProfileEdit />
    </>
  )
}

export default page
