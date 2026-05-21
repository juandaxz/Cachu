'use client'

import { useState, useTransition } from 'react'
import { createAntiHabit } from '@/app/actions/anti-habits'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { today } from '@/lib/utils'
import { Plus } from 'lucide-react'

const EMOJIS = ['🚫', '🚬', '🍺', '🎰', '📱', '🍔', '😤', '💊', '🛑', '⚠️']

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
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hábito a dejar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">¿Qué quieres dejar?</Label>
            <Input id="name" name="name" placeholder="Ej: Fumar, ver pornografía, alcohol..." required />
          </div>

          <div className="space-y-2">
            <Label>Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg border transition-all ${emoji === e ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">¿Cuándo empezaste a estar limpio?</Label>
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
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
