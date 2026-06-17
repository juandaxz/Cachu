'use client'

import { useState, useTransition } from 'react'
import { createHabit, updateHabit } from '@/app/actions/habits'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { Habit } from '@/lib/types'

const EMOJIS = ['🏃', '🏋️', '📚', '💧', '🧘', '🎯', '💤', '🥗', '🎵', '✍️', '🧠', '🚴', '🌅', '🍎', '🧹', '🌱', '🏊', '🎨', '🤸', '💊']

interface CreateProps {
  mode?: 'create'
  habit?: never
  trigger?: never
}

interface EditProps {
  mode: 'edit'
  habit: Habit
  trigger: React.ReactNode
}

type Props = CreateProps | EditProps

export function HabitForm({ mode = 'create', habit, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [emoji, setEmoji] = useState(habit?.emoji ?? EMOJIS[0])
  const [type, setType] = useState(habit?.type ?? 'boolean')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('emoji', emoji)
    formData.set('type', type)
    formData.set('color', '#1e3a5f')

    startTransition(async () => {
      const result = mode === 'edit' && habit
        ? await updateHabit(habit.id, formData)
        : await createHabit(formData)

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
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo hábito
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar hábito' : 'Nuevo hábito'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="ej. Ejercicio diario" defaultValue={habit?.name} required />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Sí / No (hecho o no)</SelectItem>
                <SelectItem value="count">Contador (cuántas veces)</SelectItem>
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
                  className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center transition-all ${emoji === e ? 'bg-primary/10 ring-2 ring-primary' : 'bg-secondary hover:bg-secondary/80'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear hábito'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
