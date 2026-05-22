'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveTemptationNote } from '@/app/actions/anti-habits'
import { MOTIVATIONAL_MESSAGES } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { AntiHabit } from '@/lib/types'

interface Props {
  antiHabit: AntiHabit
  streak: number
}

export function TemptationModal({ antiHabit, streak }: Props) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)])

  function handleSave() {
    if (!note.trim()) return
    startTransition(async () => {
      await saveTemptationNote(antiHabit.id, note.trim())
      setSaved(true)
      setTimeout(() => {
        setOpen(false)
        setNote('')
        setSaved(false)
      }, 1500)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/30 bg-white/20 text-white hover:bg-white/35 shrink-0">
          <AlertTriangle className="h-3 w-3" />
          <span className="hidden sm:inline">I&apos;m about to give in</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold">{antiHabit.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center space-y-2">
            <p className="text-base font-semibold text-foreground">{message}</p>
            {streak > 0 && (
              <p className="text-sm text-muted-foreground">
                You&apos;ve gone <span className="text-orange-400 font-bold">{streak} days</span> without {antiHabit.name.toLowerCase()}.
                <br />Don&apos;t throw it away.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">What&apos;s triggering this? (optional)</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write what you're feeling right now..."
              rows={3}
            />
          </div>

          {saved ? (
            <div className="text-center text-sm text-emerald-400 font-medium py-2">
              Saved. You can do it!
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                Close
              </Button>
              {note.trim() && (
                <Button className="flex-1" onClick={handleSave} disabled={isPending}>
                  Save note
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
