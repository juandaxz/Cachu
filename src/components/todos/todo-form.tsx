'use client'

import { useState, useTransition } from 'react'
import { createTodo, updateTodo } from '@/app/actions/todos'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import type { TodoCategory, TodoWithCategory } from '@/lib/types'

interface CreateProps {
  categories: TodoCategory[]
  mode?: 'create'
  todo?: never
  trigger?: never
}

interface EditProps {
  categories: TodoCategory[]
  mode: 'edit'
  todo: TodoWithCategory
  trigger: React.ReactNode
}

type Props = CreateProps | EditProps

export function TodoForm({ categories, mode = 'create', todo, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [urgency, setUrgency] = useState(todo?.urgency ?? 'medium')
  const [categoryId, setCategoryId] = useState(todo?.category_id ?? 'none')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const defaultDeadline = todo?.deadline
    ? format(new Date(todo.deadline), "yyyy-MM-dd'T'HH:mm")
    : ''

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('urgency', urgency)
    if (categoryId !== 'none') formData.set('category_id', categoryId)
    else formData.delete('category_id')

    startTransition(async () => {
      const result = mode === 'edit' && todo
        ? await updateTodo(todo.id, formData)
        : await createTodo(formData)

      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setError('')
        if (mode === 'create') {
          setUrgency('medium')
          setCategoryId('none')
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva tarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="¿Qué necesitas hacer?" defaultValue={todo?.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea id="description" name="description" placeholder="Detalles..." rows={2} defaultValue={todo?.description ?? ''} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Urgencia</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="risk">RIESGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Fecha límite (opcional)</Label>
            <Input id="deadline" name="deadline" type="datetime-local" defaultValue={defaultDeadline} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
