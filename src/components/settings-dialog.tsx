"use client"

import { usePlan } from '@/context/PlanProvider'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function SettingsDialog() {
  const t = useTranslations('settings')
  const { isSelfPaced, setSelfPaced, startDate, changeStartDate } = usePlan()
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="w-full max-w-md flex justify-end">
      <Button variant="outline" onClick={() => setOpen(true)}>{t('open')}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{t('selfPaced')}</div>
              <Switch checked={isSelfPaced} onCheckedChange={setSelfPaced} />
            </div>
            {!isSelfPaced && (
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">{t('startDate')}</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-auto"
                  value={formatDateInput(startDate)}
                  onChange={e => changeStartDate(new Date(e.target.value))}
                />
              </div>
            )}
            <div className="border-t pt-2">
              {!confirmReset ? (
                <Button variant="destructive" onClick={() => setConfirmReset(true)}>{t('reset')}</Button>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">{t('resetConfirm')}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setConfirmReset(false)}>{t('cancel')}</Button>
                    <Button variant="destructive" onClick={() => { changeStartDate(new Date()); setConfirmReset(false); }}>{t('reset')}</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDateInput(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth()+1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

