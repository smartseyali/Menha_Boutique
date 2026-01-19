"use client";
import Breadcrumb from '@/components/breadcrumb/Breadcrumb';
import About from '@/components/pages-section/about-us/About';

const page = () => {
  return (
    <>
      <Breadcrumb title={"About Us"} />
      <About />
    </>
  )
}

export default page
