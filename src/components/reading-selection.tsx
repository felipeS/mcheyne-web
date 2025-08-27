"use client"

import { usePlan } from '@/context/PlanProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { splitPassage } from '@/lib/planConstants'

export function ReadingSelection() {
  const { getSelection, hasRead, toggleRead } = usePlan()
  const selection = getSelection()
  const t = useTranslations('books')

  if (selection?.isLeap) {
    return (
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="flex items-center gap-2">
            <span>🤸</span>
            <span className="font-medium">{t('leap', { defaultMessage: 'Happy Leap Year!' })}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {selection.passages.map((desc, id) => {
        const { book, chapter } = splitPassage(desc)
        const localizedBook = t(book as any, { defaultMessage: book })
        const label = `${localizedBook}${chapter ? ' ' + chapter : ''}`
        const read = hasRead(desc, id)
        return (
          <Button
            key={id}
            onClick={() => toggleRead(desc, id)}
            variant={read ? 'secondary' : 'default'}
            className="justify-start h-16 rounded-full bg-accent text-accent-foreground hover:bg-accent/80"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">{read ? '◉' : '○'}</div>
              <div className="text-base font-medium">{label}</div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}

