'use client'

import { useState, useTransition } from 'react'
import { createHabit } from '@/app/actions/habits'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6']
const EMOJIS = ['🏃', '🏋️', '📚', '💧', '🧘', '🎯', '💤', '🥗', '🎵', '✍️', '🧠', '🚴', '🌅', '🍎', '🧹', '🌱', '🏊', '🎨', '🤸', '💊']

export function HabitForm() {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(COLORS[0])
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [type, setType] = useState('boolean')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('color', color)
    formData.set('emoji', emoji)
    formData.set('type', type)

    startTransition(async () => {
      const result = await createHabit(formData)
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
          New habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="e.g. Exercise daily" required />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Yes / No (did or didn&apos;t)</SelectItem>
                <SelectItem value="count">Counter (how many times)</SelectItem>
              </SelectContent>
            </Select>
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
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Saving...' : 'Create habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
