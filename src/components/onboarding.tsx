"use client"

import { usePlan } from '@/context/PlanProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

export function Onboarding() {
  const t = useTranslations('onboarding')
  const { onboarded, setOnboarded, isSelfPaced, setSelfPaced, changeStartDate } = usePlan()

  if (onboarded) return null

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">{t('intro')}</div>
        <div className="flex items-center justify-between">
          <div className="font-medium">{t('selfPaced')}</div>
          <input type="checkbox" checked={isSelfPaced} onChange={e => setSelfPaced(e.target.checked)} />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">{t('importProgress')}</label>
          <input type="date" onChange={e => e.target.value && changeStartDate(new Date(e.target.value))} />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOnboarded(true)}>{t('next')}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

