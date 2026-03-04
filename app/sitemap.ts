import { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n'
import { RAW_PLAN_DATA } from '@/lib/planConstants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.mcheyne.app'

  const pages = [
    { url: `${baseUrl}`, lastModified: new Date() },
  ]

  locales.forEach((locale) => {
    pages.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
    })

    // Add plan index
    pages.push({
      url: `${baseUrl}/${locale}/plan`,
      lastModified: new Date(),
    })

    // Add individual days
    RAW_PLAN_DATA.forEach((_, index) => {
      pages.push({
        url: `${baseUrl}/${locale}/day/${index + 1}`,
        lastModified: new Date(),
      })
    })
  })

  return pages
}
