'use client'

import { useState, useEffect, useTransition } from 'react'
import { completeTodoFromDashboard } from '@/app/actions/todos'
import { format, parseISO, isPast, isToday } from 'date-fns'
import type { Urgency } from '@/lib/types'

const URGENCY_COLOR: Record<string, string> = {
  risk: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#2563eb',
}

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
  const color = URGENCY_COLOR[todo.urgency as Urgency] ?? '#475569'
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline))

  useEffect(() => {
    if (localStorage.getItem(todayKey(todo.id)) === '1') setDone(true)
  }, [todo.id])

  function handleCheck() {
    if (done) return
    setDone(true)
    localStorage.setItem(todayKey(todo.id), '1')
    startTransition(() => completeTodoFromDashboard(todo.id))
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3 transition-opacity ${isPending || done ? 'opacity-60' : ''}`}
      style={{ backgroundColor: color }}
    >
      <button
        onClick={handleCheck}
        disabled={isPending || done}
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
          done ? 'bg-white text-gray-800' : 'bg-white/25 text-white'
        }`}
      >
        {done ? '✓' : null}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-white transition-all ${done ? 'line-through' : ''}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {todo.todo_categories && (
            <span className="text-xs text-white/70">{todo.todo_categories.name}</span>
          )}
          {todo.deadline && (
            <span className={`text-xs ${isOverdue && !done ? 'text-white font-medium' : 'text-white/60'}`}>
              {isOverdue && !done ? 'Overdue · ' : ''}{format(parseISO(todo.deadline), 'd MMM')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
