'use client'

import { useState, useTransition } from 'react'
import { createAntiHabit } from '@/app/actions/anti-habits'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { today } from '@/lib/utils'
import { Plus } from 'lucide-react'

const EMOJIS = ['🚬', '🍺', '🍔', '📱', '🎰', '🍬', '☕', '🎮', '🛒', '🍷', '🌿', '🍫', '🧁', '🍕', '🥤', '💊']

export function AntiHabitForm() {
  const [open, setOpen] = useState(false)
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('emoji', emoji)

    startTransition(async () => {
      const result = await createAntiHabit(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setError('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Habit to quit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">What do you want to quit?</Label>
            <Input id="name" name="name" placeholder="e.g. Smoking, alcohol, social media..." required />
          </div>

          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center transition-all ${emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary hover:bg-secondary/80'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">When did you start being clean?</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={today()}
              max={today()}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
