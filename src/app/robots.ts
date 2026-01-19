import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://pattikadai.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/my-orders/', '/user-profile/', '/cart/', '/checkout/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
