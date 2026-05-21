'use client'

import { useState, useTransition } from 'react'
import { checkinHabit, uncheckinHabit, deleteHabit, archiveHabit } from '@/app/actions/habits'
import { Heatmap } from '@/components/heatmap'
import { Flame, Trash2, Archive, ChevronDown, ChevronUp } from 'lucide-react'
import type { Habit } from '@/lib/types'

interface Props {
  habit: Habit
  checkinMap: Record<string, number>
  streak: number
  checkedToday: boolean
  todayValue: number
}

export function HabitCard({ habit, checkinMap, streak, checkedToday, todayValue }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [count, setCount] = useState(todayValue || 1)
  const [isPending, startTransition] = useTransition()

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) {
        await uncheckinHabit(habit.id)
      } else {
        await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
      }
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este hábito y todo su historial?')) return
    startTransition(() => deleteHabit(habit.id))
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={isPending}
          className={`h-10 w-10 shrink-0 rounded-xl border-2 flex items-center justify-center text-lg transition-all ${
            checkedToday
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
              : 'border-border bg-transparent hover:border-primary/50'
          }`}
        >
          {checkedToday ? '✓' : habit.emoji}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{habit.name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {streak > 0 && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <Flame className="h-3 w-3" /> {streak} días
              </span>
            )}
            {habit.type === 'count' && checkedToday && (
              <span className="text-xs text-muted-foreground">{todayValue}x hoy</span>
            )}
          </div>
        </div>

        {/* Count controls for non-checked */}
        {habit.type === 'count' && !checkedToday && (
          <div className="flex items-center gap-1 mr-1">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="h-7 w-7 rounded border border-border text-sm hover:bg-secondary">−</button>
            <span className="text-sm w-6 text-center text-foreground">{count}</span>
            <button onClick={() => setCount(count + 1)} className="h-7 w-7 rounded border border-border text-sm hover:bg-secondary">+</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={() => startTransition(() => archiveHabit(habit.id, true))} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <Archive className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <Heatmap valueMap={checkinMap} />
        </div>
      )}
    </div>
  )
}
