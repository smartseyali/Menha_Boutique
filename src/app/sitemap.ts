import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://pattikadai.com'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products?limit=1000`, {
      next: { revalidate: 3600 } 
    })
    
    if (!res.ok) {
        console.error('Sitemap: Failed to fetch products', res.statusText)
        return []
    }
    
    const data = await res.json()
    return data.products || []
  } catch (error) {
    console.error('Sitemap: Error fetching products', error)
    return []
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
       next: { revalidate: 3600 }
    })
    
    if (!res.ok) {
        console.error('Sitemap: Failed to fetch categories', res.statusText)
        return []
    }

    const data = await res.json()
    return data.categories || []
  } catch (error) {
    console.error('Sitemap: Error fetching categories', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const categories = await getCategories()

  const productUrls = products.map((product: any) => ({
    url: `${BASE_URL}/product/${product.id}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = categories.map((category: any) => {
    const categoryName = category.category || category.name || category.id;
    return {
        url: `${BASE_URL}/category/${encodeURIComponent(categoryName)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }
  })

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop-full-width-col-4`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
       url: `${BASE_URL}/bestselling`,
       lastModified: new Date(),
       changeFrequency: 'daily',
       priority: 0.9,
    },
    {
       url: `${BASE_URL}/specials`,
       lastModified: new Date(),
       changeFrequency: 'daily',
       priority: 0.9,
    },
    {
       url: `${BASE_URL}/combos`,
       lastModified: new Date(),
       changeFrequency: 'daily',
       priority: 0.9,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
        url: `${BASE_URL}/faq`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    },
    ...categoryUrls,
    ...productUrls,
  ]
}
