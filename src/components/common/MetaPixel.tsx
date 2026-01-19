"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { authStorage } from "@/utils/authStorage";

declare global {
  interface Window {
    fbq: any;
  }
}


const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.login);
  const [pixelInitDone, setPixelInitDone] = useState(false);

  // Initialize Pixel and handle User Data changes
  useEffect(() => {
    if (!META_PIXEL_ID) return;
    
    // Determine user data for Advanced Matching
    // Preference: Redux state > AuthStorage > null
    // We check AuthStorage directly here too in case Redux isn't ready, though it should be synced by AuthInitializer
    let email = user?.email;
    let phone = user?.phoneNumber;

    if (!email || !phone) {
        const storedUser = authStorage.getUserData();
        if (storedUser) {
            email = email || storedUser.email;
            phone = phone || storedUser.phoneNumber;
        }
    }

    const advancedMatching = (email || phone) ? {
      em: email,
      ph: phone,
    } : undefined; // Use undefined instead of empty object to be cleaner

    // Determine if window.fbq exists
    if (typeof window !== "undefined" && window.fbq) {
      // Re-initialize or initialize with data
      // init call updates the user data for future events
      window.fbq('init', META_PIXEL_ID, advancedMatching);
    }
  }, [user]); // Re-run when user logs in/out

  // Track PageView on route change
  useEffect(() => {
    if (!META_PIXEL_ID) return;
    // We set a small timeout or just call it to ensure init processed
    if (typeof window !== "undefined" && window.fbq) {
        window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            // Initial init call (will be updated by useEffect if user data exists)
            fbq('init', '${META_PIXEL_ID}'); 
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
