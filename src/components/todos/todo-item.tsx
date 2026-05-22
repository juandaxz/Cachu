'use client'

import { useState, useTransition } from 'react'
import { updateTodoStatus, deleteTodo } from '@/app/actions/todos'
import { Trash2, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import type { TodoWithCategory, TodoStatus, Urgency } from '@/lib/types'

const URGENCY_COLOR: Record<string, string> = {
  risk: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#2563eb',
}

const SNAP_OPEN = -80

interface Props {
  todo: TodoWithCategory
}

export function TodoItem({ todo }: Props) {
  const [isPending, startTransition] = useTransition()
  const [swipeX, setSwipeX] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [cardXAtTouchStart, setCardXAtTouchStart] = useState(0)
  const [activeSwiping, setActiveSwiping] = useState(false)

  const color = URGENCY_COLOR[todo.urgency as Urgency] ?? '#475569'
  const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline)) && todo.status !== 'done'
  const isDueSoon = todo.deadline && isToday(parseISO(todo.deadline)) && todo.status !== 'done'

  const StatusIcon = todo.status === 'done' ? CheckCircle2 : todo.status === 'in_progress' ? Clock : Circle

  function cycleStatus() {
    const next = todo.status === 'pending' ? 'in_progress' : todo.status === 'in_progress' ? 'done' : 'pending'
    startTransition(() => updateTodoStatus(todo.id, next as TodoStatus))
  }

  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX)
    setCardXAtTouchStart(swipeX)
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX
    setActiveSwiping(true)
    setSwipeX(Math.max(SNAP_OPEN, Math.min(0, cardXAtTouchStart + dx)))
  }

  function onTouchEnd() {
    setActiveSwiping(false)
    setSwipeX(swipeX < -40 ? SNAP_OPEN : 0)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete zone */}
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex flex-col items-center justify-center gap-1 rounded-r-2xl">
        <button
          onClick={() => startTransition(() => deleteTodo(todo.id))}
          className="flex flex-col items-center gap-1"
        >
          <Trash2 className="h-5 w-5 text-white" />
          <span className="text-white text-[10px] font-medium">Delete</span>
        </button>
      </div>

      {/* Main card */}
      <div
        className={`relative flex items-start gap-3 rounded-2xl p-3 ${!activeSwiping ? 'transition-transform duration-200' : ''} ${isPending || todo.status === 'done' ? 'opacity-70' : ''}`}
        style={{ backgroundColor: color, transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button onClick={cycleStatus} className="mt-0.5 shrink-0 text-white/80 hover:text-white transition-colors">
          <StatusIcon className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <p className={`text-sm font-bold text-white ${todo.status === 'done' ? 'line-through opacity-70' : ''}`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className="text-xs text-white/70">{todo.description}</p>
          )}
          <div className="flex items-center flex-wrap gap-2">
            {todo.todo_categories && (
              <span className="text-xs font-medium text-white/80">{todo.todo_categories.name}</span>
            )}
            {todo.deadline && (
              <span className={`text-xs font-medium ${isOverdue ? 'text-white' : 'text-white/70'}`}>
                {isOverdue ? 'Overdue · ' : isDueSoon ? 'Due today · ' : ''}{format(parseISO(todo.deadline), 'd MMM, HH:mm')}
              </span>
            )}
          </div>
        </div>

        {/* Desktop delete */}
        <button
          onClick={() => { if (confirm('Delete this task?')) startTransition(() => deleteTodo(todo.id)) }}
          className="hidden sm:block p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-400/60 transition-colors shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
