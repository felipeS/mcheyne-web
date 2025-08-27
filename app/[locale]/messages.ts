import {getRequestConfig} from 'next-intl/server'
import {defaultLocale} from '@/lib/i18n'

export default getRequestConfig(async ({locale}) => {
  const l = (locale ?? defaultLocale) as string
  return {
    locale: l,
    messages: (await import(`../../messages/${l}.json`)).default
  }
})

