'use client'

import { useTransition } from 'react'
import { updateTodoStatus, deleteTodo } from '@/app/actions/todos'
import { Trash2, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { URGENCY_CONFIG } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import type { TodoWithCategory, TodoStatus } from '@/lib/types'

interface Props {
  todo: TodoWithCategory
}

export function TodoItem({ todo }: Props) {
  const [isPending, startTransition] = useTransition()

  const urgency = URGENCY_CONFIG[todo.urgency as keyof typeof URGENCY_CONFIG]
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline)) && todo.status !== 'done'
  const isDueSoon = todo.deadline && isToday(parseISO(todo.deadline)) && todo.status !== 'done'

  const StatusIcon = todo.status === 'done' ? CheckCircle2 : todo.status === 'in_progress' ? Clock : Circle

  function cycleStatus() {
    const next = todo.status === 'pending' ? 'in_progress' : todo.status === 'in_progress' ? 'done' : 'pending'
    startTransition(() => updateTodoStatus(todo.id, next as TodoStatus))
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTodo(todo.id)
      toast.success('Tarea eliminada')
    })
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-opacity ${isPending || todo.status === 'done' ? 'opacity-60' : ''}`}>
      <button
        onClick={cycleStatus}
        className={`mt-0.5 shrink-0 transition-colors ${
          todo.status === 'done' ? 'text-primary' : todo.status === 'in_progress' ? 'text-primary/70' : 'text-muted-foreground hover:text-primary'
        }`}
        title={todo.status === 'pending' ? 'Marcar en progreso' : todo.status === 'in_progress' ? 'Marcar como hecho' : 'Volver a pendiente'}
      >
        <StatusIcon className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm font-medium text-foreground ${todo.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-muted-foreground">{todo.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-2">
          {urgency && (
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${urgency.color}`}>
              {urgency.label}
            </span>
          )}
          {todo.todo_categories && (
            <span className="text-xs text-muted-foreground">{todo.todo_categories.name}</span>
          )}
          {todo.deadline && (
            <span className={`text-xs ${isOverdue ? 'text-destructive font-medium' : isDueSoon ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {isOverdue ? 'Vencido · ' : isDueSoon ? 'Hoy · ' : ''}{format(parseISO(todo.deadline), 'd MMM, HH:mm')}
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        title="¿Eliminar tarea?"
        description="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        trigger={
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors shrink-0">
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
    </div>
  )
}
