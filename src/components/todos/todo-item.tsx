'use client'

import { useTransition } from 'react'
import { updateTodoStatus, deleteTodo } from '@/app/actions/todos'
import { URGENCY_CONFIG, STATUS_CONFIG } from '@/lib/utils'
import { Trash2, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TodoWithCategory } from '@/lib/types'

interface Props {
  todo: TodoWithCategory
}

export function TodoItem({ todo }: Props) {
  const [isPending, startTransition] = useTransition()
  const urgency = URGENCY_CONFIG[todo.urgency]
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline)) && todo.status !== 'done'
  const isDueSoon = todo.deadline && isToday(parseISO(todo.deadline)) && todo.status !== 'done'

  function cycleStatus() {
    const next = todo.status === 'pending' ? 'in_progress' : todo.status === 'in_progress' ? 'done' : 'pending'
    startTransition(() => updateTodoStatus(todo.id, next))
  }

  function handleDelete() {
    if (!confirm('¿Eliminar esta tarea?')) return
    startTransition(() => deleteTodo(todo.id))
  }

  const StatusIcon = todo.status === 'done'
    ? CheckCircle2
    : todo.status === 'in_progress'
    ? Clock
    : Circle

  return (
    <div className={`flex items-start gap-3 rounded-xl border bg-card p-3 transition-opacity ${isPending ? 'opacity-50' : ''} ${todo.status === 'done' ? 'border-border/50 opacity-60' : 'border-border'}`}>
      <button onClick={cycleStatus} className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors">
        <StatusIcon className={`h-5 w-5 ${todo.status === 'done' ? 'text-emerald-400' : todo.status === 'in_progress' ? 'text-blue-400' : ''}`} />
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm font-medium ${todo.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-muted-foreground">{todo.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-xs font-semibold ${urgency.color}`}>
            {urgency.label}
          </span>
          {todo.todo_categories && (
            <span className="text-xs font-medium" style={{ color: todo.todo_categories.color }}>
              {todo.todo_categories.name}
            </span>
          )}
          {todo.deadline && (
            <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : isDueSoon ? 'text-yellow-400' : 'text-muted-foreground'}`}>
              {isOverdue ? '⚠️ ' : isDueSoon ? '⏰ ' : ''}{format(parseISO(todo.deadline), "d MMM, HH:mm", { locale: es })}
            </span>
          )}
          {todo.status !== 'pending' && (
            <span className={`text-xs ${STATUS_CONFIG[todo.status].color}`}>{STATUS_CONFIG[todo.status].label}</span>
          )}
        </div>
      </div>

      <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
