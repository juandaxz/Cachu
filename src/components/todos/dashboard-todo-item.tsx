'use client'

import { useState, useEffect, useTransition } from 'react'
import { completeTodoFromDashboard } from '@/app/actions/todos'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { Check } from 'lucide-react'
import { URGENCY_CONFIG } from '@/lib/utils'

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
  const urgencyConfig = URGENCY_CONFIG[todo.urgency as keyof typeof URGENCY_CONFIG]
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
    <div className={`flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-opacity ${isPending || done ? 'opacity-50' : ''}`}>
      <button
        onClick={handleCheck}
        disabled={isPending || done}
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
          done
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        {done && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground transition-all ${done ? 'line-through text-muted-foreground' : ''}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {urgencyConfig && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${urgencyConfig.color}`}>
              {urgencyConfig.label}
            </span>
          )}
          {todo.todo_categories && (
            <span className="text-xs text-muted-foreground">{todo.todo_categories.name}</span>
          )}
          {todo.deadline && (
            <span className={`text-xs ${isOverdue && !done ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {isOverdue && !done ? 'Vencido · ' : ''}{format(parseISO(todo.deadline), 'd MMM')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
