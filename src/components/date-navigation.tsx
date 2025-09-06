"use client"

import React from 'react'
import { usePlan } from '@/context/PlanProvider'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function DateNavigation() {
  const { selections, indexForToday, selectedIndex, setSelectedIndex } = usePlan()
  const t = useTranslations('app')

  const isFirst = selectedIndex === 0
  const isLast = selectedIndex === selections.length - 1

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-2">
      <div className="flex w-full items-center gap-2">
        <Button disabled={isFirst} onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))} variant="outline">←</Button>
        <div className="flex-1 text-center text-sm text-muted-foreground">
          {t('dateLabel', { daysFromToday: selectedIndex - indexForToday })}
        </div>
        <Button disabled={isLast} onClick={() => setSelectedIndex(Math.min(selections.length - 1, selectedIndex + 1))} variant="outline">→</Button>
      </div>
      {selectedIndex !== indexForToday ? (
        <Button onClick={() => setSelectedIndex(indexForToday)} variant="soft">{t('today')}</Button>
      ) : (
        <div className="h-9" />
      )}
    </div>
  )
}

