'use client'

import { useState, useTransition } from 'react'
import { checkinHabit, uncheckinHabit, deleteHabit, archiveHabit } from '@/app/actions/habits'
import { Heatmap } from '@/components/heatmap'
import { Flame, Trash2, Archive, Plus, Check } from 'lucide-react'
import type { Habit } from '@/lib/types'

interface Props {
  habit: Habit
  checkinMap: Record<string, number>
  streak: number
  checkedToday: boolean
  todayValue: number
}

const SNAP_OPEN = -80

export function HabitCard({ habit, checkinMap, streak, checkedToday, todayValue }: Props) {
  const [count, setCount] = useState(todayValue || 1)
  const [isPending, startTransition] = useTransition()
  const [swipeX, setSwipeX] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [cardXAtTouchStart, setCardXAtTouchStart] = useState(0)
  const [activeSwiping, setActiveSwiping] = useState(false)

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) await uncheckinHabit(habit.id)
      else await checkinHabit(habit.id, habit.type === 'count' ? count : 1)
    })
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
          onClick={() => startTransition(() => deleteHabit(habit.id))}
          className="flex flex-col items-center gap-1"
        >
          <Trash2 className="h-5 w-5 text-white" />
          <span className="text-white text-[10px] font-medium">Delete</span>
        </button>
      </div>

      {/* Main card */}
      <div
        className={`relative bg-card rounded-2xl ${!activeSwiping ? 'transition-transform duration-200' : ''} ${isPending ? 'opacity-60' : ''}`}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-3 pb-2">
          {/* Emoji box */}
          <div
            className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: habit.color }}
          >
            {habit.emoji || habit.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-foreground text-sm leading-tight ${checkedToday ? 'line-through opacity-50' : ''}`}>
              {habit.name}
            </p>
            {streak > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Flame className="h-3 w-3" style={{ color: habit.color }} />
                {streak} day streak
              </p>
            )}
          </div>

          {/* Count controls */}
          {habit.type === 'count' && !checkedToday && (
            <div className="flex items-center gap-1">
              <button onClick={() => setCount(Math.max(1, count - 1))} className="h-6 w-6 rounded-lg bg-secondary text-foreground text-xs font-bold">−</button>
              <span className="text-sm w-5 text-center text-foreground font-medium">{count}</span>
              <button onClick={() => setCount(count + 1)} className="h-6 w-6 rounded-lg bg-secondary text-foreground text-xs font-bold">+</button>
            </div>
          )}

          {habit.type === 'count' && checkedToday && (
            <span className="text-xs text-muted-foreground mr-1">{todayValue}x</span>
          )}

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={isPending}
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
              checkedToday
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-transparent'
            }`}
            style={!checkedToday ? { borderColor: habit.color, color: habit.color } : {}}
          >
            {checkedToday ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-1 ml-1">
            <button onClick={() => startTransition(() => archiveHabit(habit.id, true))} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Archive className="h-4 w-4" />
            </button>
            <button onClick={() => { if (confirm('Delete this habit?')) startTransition(() => deleteHabit(habit.id)) }} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Heatmap — always visible */}
        <div className="px-3 pb-3">
          <Heatmap valueMap={checkinMap} history compact color={habit.color} />
        </div>
      </div>
    </div>
  )
}
