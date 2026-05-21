'use client'

import { useState, useEffect, useTransition } from 'react'
import { completeTodoFromDashboard } from '@/app/actions/todos'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { URGENCY_CONFIG } from '@/lib/utils'
import type { Urgency } from '@/lib/types'

interface DashboardTodo {
  id: string
  title: string
  urgency: string
  status: string
  deadline?: string | null
  todo_categories?: { name: string; color: string } | null
}

function todayKey(id: string) {
  const d = new Date().toISOString().slice(0, 10)
  return `dashboard-done-${id}-${d}`
}

export function DashboardTodoItem({ todo }: { todo: DashboardTodo }) {
  const [done, setDone] = useState(todo.status === 'done')
  const [isPending, startTransition] = useTransition()

  // Restore done state from localStorage (persists until end of day)
  useEffect(() => {
    if (localStorage.getItem(todayKey(todo.id)) === '1') setDone(true)
  }, [todo.id])

  const urgency = URGENCY_CONFIG[todo.urgency as Urgency]
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline))

  function handleCheck() {
    if (done) return
    setDone(true)
    localStorage.setItem(todayKey(todo.id), '1')
    startTransition(() => completeTodoFromDashboard(todo.id))
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl border bg-card p-3 transition-colors ${done ? 'border-border/40 opacity-60' : 'border-border'}`}>
      <button
        onClick={handleCheck}
        disabled={isPending || done}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
          done
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
            : 'border-border hover:border-primary/60'
        }`}
      >
        {done && <span className="text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-all ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${urgency.color}`}>
            {urgency.label}
          </span>
          {todo.todo_categories && (
            <span className="text-xs truncate" style={{ color: todo.todo_categories.color }}>
              {todo.todo_categories.name}
            </span>
          )}
          {todo.deadline && (
            <span className={`text-xs shrink-0 ${isOverdue && !done ? 'text-red-400' : 'text-muted-foreground'}`}>
              {isOverdue && !done ? '⚠️ ' : ''}{format(parseISO(todo.deadline), 'd MMM', { locale: es })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
