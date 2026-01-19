"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { productApi } from "@/utils/api";

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to shop page or fetch first product
    const redirectToFirstProduct = async () => {
      try {
        const products = await productApi.getAll({ page: 1, limit: 1 });
        if (products && products.length > 0) {
          router.push(`/product/${products[0].id}`);
        } else {
          router.push("/shop-full-width-col-4");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        router.push("/shop-full-width-col-4");
      }
    };

    redirectToFirstProduct();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
      }}
    >
      <p>Redirecting to product page...</p>
    </div>
  );
};

export default Page;
