import * as React from 'react'
import {cn} from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({open, onOpenChange, children}: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className={cn('relative z-10 w-full max-w-md rounded-lg border bg-background p-4 shadow-lg')}>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({children}:{children: React.ReactNode}) {
  return <div className="mb-2 text-lg font-semibold">{children}</div>
}

export function DialogFooter({children}:{children: React.ReactNode}) {
  return <div className="mt-4 flex justify-end gap-2">{children}</div>
}

