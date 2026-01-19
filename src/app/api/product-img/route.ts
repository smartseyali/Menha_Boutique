import { NextRequest, NextResponse } from "next/server";
import { productApi, getImageUrl } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json().catch(() => ({}));
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product by ID from backend API
    const product = await productApi.getById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get product images - primary image and additional images
    const images = [];
    
    // Add primary image
    if (product.primary_image) {
      images.push({ image: getImageUrl(product.primary_image) });
    }
    
    // Add additional images from product.images array
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        if (img.image_url && img.image_url !== product.primary_image) {
          images.push({ image: getImageUrl(img.image_url) });
        }
      });
    }
    
    // If no images, return default
    if (images.length === 0) {
      images.push({ image: getImageUrl("/assets/img/product/default.jpg") });
    }

    return NextResponse.json(images);
  } catch (error: any) {
    console.error("Error fetching product images:", error);
    return NextResponse.json({ error: "Failed to fetch product images" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId");
    
    // Also check POST body for productId (for compatibility)
    if (!productId) {
      try {
        const body = await req.json().catch(() => ({}));
        productId = body.productId;
      } catch {
        // Ignore JSON parse errors
      }
    }
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Fetch product by ID from backend API
    const product = await productApi.getById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get product images
    const images = [];
    
    if (product.primary_image) {
      images.push({ image: getImageUrl(product.primary_image) });
    }
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        if (img.image_url && img.image_url !== product.primary_image) {
          images.push({ image: getImageUrl(img.image_url) });
        }
      });
    }
    
    if (images.length === 0) {
      images.push({ image: getImageUrl("/assets/img/product/default.jpg") });
    }

    return NextResponse.json(images);
  } catch (error: any) {
    console.error("Error fetching product images:", error);
    return NextResponse.json({ error: "Failed to fetch product images" }, { status: 500 });
  }
}
