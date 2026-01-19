// Item Name: Blueberry - eCommerce Next JS template.
// Author: Maraviya Infotech
// Version: 1
// Copyright 2024

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "@/styles/custom.css";
import Providers from "@/store/Provider";
import Layout from "@/components/layout";
import MetaPixel from "@/components/common/MetaPixel";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Menha Boutique - Admin Portal",
  description: "Menha Boutique - High quality fashion and accessories management portal",

  icons: {
    icon: "/assets/img/favicon/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/remixicon.css" />
        <link rel="stylesheet" href="/assets/css/vendor/aos.css" />
        <link rel="stylesheet" href="/assets/css/vendor/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/owl.carousel.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/animate.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/jquery-range-ui.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <meta name="google-site-verification" content="0KIhM3qtAWQmMd_by-SQChU_tEnTpjCICJiBk2kiLGI" />
        <meta name="facebook-domain-verification" content="kp7yj5nn348q5h8sq62p3wd8c935rk" />
      </head>
      <body>
        {/* Google Analytics 4 */}
        {gaMeasurementId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}


        <Providers>
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
