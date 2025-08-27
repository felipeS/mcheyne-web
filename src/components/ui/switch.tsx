import * as React from 'react'
import {cn} from '@/lib/utils'

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({checked, onCheckedChange, className, ...props}, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      ref={ref}
      className={cn('inline-flex h-6 w-11 items-center rounded-full border transition-colors', checked ? 'bg-primary' : 'bg-muted', className)}
      {...props}
    >
      <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  )
})
Switch.displayName = 'Switch'

