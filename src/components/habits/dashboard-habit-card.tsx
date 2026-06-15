'use client'

import { useState, useTransition } from 'react'
import { checkinHabit, uncheckinHabit } from '@/app/actions/habits'
import { Flame, Check, Plus } from 'lucide-react'
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
      if (!next) await uncheckinHabit(habit.id)
      else await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
    })
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-base">
        {habit.emoji || habit.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground ${checked ? 'line-through text-muted-foreground' : ''}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Flame className="h-3 w-3 text-primary" /> {streak} días
          </p>
        )}
      </div>

      {habit.type === 'count' && !checked && (
        <div className="flex items-center gap-1">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="h-6 w-6 rounded-md bg-secondary text-foreground text-xs font-bold">−</button>
          <span className="text-sm w-5 text-center text-foreground font-medium">{count}</span>
          <button onClick={() => setCount(count + 1)} className="h-6 w-6 rounded-md bg-secondary text-foreground text-xs font-bold">+</button>
        </div>
      )}

      {habit.type === 'count' && checked && (
        <span className="text-xs text-muted-foreground">{todayValue || count}x</span>
      )}

      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
          checked
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
