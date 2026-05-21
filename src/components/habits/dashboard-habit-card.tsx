'use client'

import { useState, useTransition } from 'react'
import { checkinHabit, uncheckinHabit } from '@/app/actions/habits'
import { Flame } from 'lucide-react'
import type { Habit } from '@/lib/types'

interface Props {
  habit: Habit
  checkedToday: boolean
  todayValue: number
  streak: number
}

export function DashboardHabitCard({ habit, checkedToday: initialChecked, todayValue, streak }: Props) {
  const [isPending, startTransition] = useTransition()
  const [checked, setChecked] = useState(initialChecked)
  const [count, setCount] = useState(todayValue || 1)

  function handleCheck() {
    const next = !checked
    setChecked(next)
    startTransition(async () => {
      if (!next) {
        await uncheckinHabit(habit.id)
      } else {
        await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
      }
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-8 w-8 shrink-0 rounded-lg border-2 flex items-center justify-center text-base transition-all ${
          checked
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
            : 'border-border bg-transparent hover:border-primary/50'
        }`}
      >
        {checked ? '✓' : habit.emoji}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-all ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-orange-400 flex items-center gap-1">
            <Flame className="h-3 w-3" /> {streak} días de racha
          </p>
        )}
      </div>

      {habit.type === 'count' && !checked && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCount(Math.max(1, count - 1))}
            className="h-6 w-6 rounded border border-border text-xs hover:bg-secondary"
          >−</button>
          <span className="text-sm w-6 text-center text-foreground">{count}</span>
          <button
            onClick={() => setCount(count + 1)}
            className="h-6 w-6 rounded border border-border text-xs hover:bg-secondary"
          >+</button>
        </div>
      )}

      {habit.type === 'count' && checked && (
        <span className="text-sm text-muted-foreground">{todayValue || count}x</span>
      )}
    </div>
  )
}
