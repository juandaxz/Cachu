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
      if (!next) await uncheckinHabit(habit.id)
      else await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
    })
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}
      style={{ backgroundColor: habit.color }}
    >
      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold transition-all ${
          checked ? 'bg-white text-gray-800' : 'bg-white/25 text-white'
        }`}
      >
        {checked ? '✓' : (habit.emoji || habit.name.charAt(0).toUpperCase())}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-white transition-all ${checked ? 'line-through opacity-60' : ''}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-white/70 flex items-center gap-1">
            <Flame className="h-3 w-3" /> {streak} day streak
          </p>
        )}
      </div>

      {habit.type === 'count' && !checked && (
        <div className="flex items-center gap-1">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="h-6 w-6 rounded-lg bg-white/25 text-white text-xs font-bold">−</button>
          <span className="text-sm w-5 text-center text-white font-medium">{count}</span>
          <button onClick={() => setCount(count + 1)} className="h-6 w-6 rounded-lg bg-white/25 text-white text-xs font-bold">+</button>
        </div>
      )}

      {habit.type === 'count' && checked && (
        <span className="text-sm text-white/70">{todayValue || count}x</span>
      )}
    </div>
  )
}
