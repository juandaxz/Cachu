'use client'

import { useState, useTransition } from 'react'
import { checkinHabit, uncheckinHabit, deleteHabit, archiveHabit } from '@/app/actions/habits'
import { Flame, Trash2, Archive, Plus, Check } from 'lucide-react'
import type { Habit } from '@/lib/types'

interface Props {
  habit: Habit
  checkinMap: Record<string, number>
  streak: number
  checkedToday: boolean
  todayValue: number
}

export function HabitCard({ habit, checkinMap, streak, checkedToday, todayValue }: Props) {
  const [count, setCount] = useState(todayValue || 1)
  const [isPending, startTransition] = useTransition()

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) await uncheckinHabit(habit.id)
      else await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
    })
  }

  return (
    <div className={`bg-card border border-border rounded-xl flex items-center gap-3 px-4 py-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      {/* Emoji */}
      <div className="h-9 w-9 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-lg">
        {habit.emoji || habit.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-foreground text-sm ${checkedToday ? 'line-through text-muted-foreground' : ''}`}>
          {habit.name}
        </p>
        {streak > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Flame className="h-3 w-3 text-primary" />
            {streak} días seguidos
          </p>
        )}
      </div>

      {/* Count controls */}
      {habit.type === 'count' && !checkedToday && (
        <div className="flex items-center gap-1">
          <button onClick={() => setCount(Math.max(1, count - 1))} className="h-6 w-6 rounded-md bg-secondary text-foreground text-xs font-bold">−</button>
          <span className="text-sm w-5 text-center text-foreground font-medium">{count}</span>
          <button onClick={() => setCount(count + 1)} className="h-6 w-6 rounded-md bg-secondary text-foreground text-xs font-bold">+</button>
        </div>
      )}

      {habit.type === 'count' && checkedToday && (
        <span className="text-xs text-muted-foreground">{todayValue}x</span>
      )}

      {/* Check button */}
      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
          checkedToday
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        {checkedToday ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => startTransition(() => archiveHabit(habit.id, true))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Archive className="h-4 w-4" />
        </button>
        <button onClick={() => { if (confirm('¿Eliminar este hábito?')) startTransition(() => deleteHabit(habit.id)) }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
