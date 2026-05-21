'use client'

import { useTransition } from 'react'
import { updateTodoStatus, deleteTodo } from '@/app/actions/todos'
import { URGENCY_CONFIG } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TodoWithCategory, TodoStatus } from '@/lib/types'

const COLUMNS: { id: TodoStatus; label: string; color: string }[] = [
  { id: 'pending', label: 'Pendiente', color: 'border-border' },
  { id: 'in_progress', label: 'En progreso', color: 'border-blue-500/50' },
  { id: 'done', label: 'Hecho', color: 'border-emerald-500/50' },
]

interface Props {
  todos: TodoWithCategory[]
}

function KanbanCard({ todo }: { todo: TodoWithCategory }) {
  const [isPending, startTransition] = useTransition()
  const urgency = URGENCY_CONFIG[todo.urgency]
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline)) && todo.status !== 'done'

  return (
    <div className={`rounded-xl border border-border bg-card p-3 space-y-2 ${isPending ? 'opacity-50' : ''}`}>
      <p className={`text-sm font-medium ${todo.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {todo.title}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded border px-1.5 py-0.5 text-xs font-semibold ${urgency.color}`}>
          {urgency.label}
        </span>
        {todo.todo_categories && (
          <span className="text-xs font-medium" style={{ color: todo.todo_categories.color }}>
            {todo.todo_categories.name}
          </span>
        )}
        {todo.deadline && (
          <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
            {isOverdue ? '⚠️ ' : ''}{format(parseISO(todo.deadline), "d MMM", { locale: es })}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {COLUMNS.filter((c) => c.id !== todo.status).map((col) => (
          <button
            key={col.id}
            onClick={() => startTransition(() => updateTodoStatus(todo.id, col.id))}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5 hover:bg-secondary transition-colors"
          >
            → {col.label}
          </button>
        ))}
        <button
          onClick={() => { if (confirm('¿Eliminar?')) startTransition(() => deleteTodo(todo.id)) }}
          className="ml-auto p-1 hover:text-destructive text-muted-foreground transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function TodoKanban({ todos }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTodos = todos.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className={`rounded-xl border-2 ${col.color} bg-secondary/30 p-3 space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{colTodos.length}</span>
            </div>
            <div className="space-y-2">
              {colTodos.map((todo) => <KanbanCard key={todo.id} todo={todo} />)}
              {colTodos.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin tareas</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
