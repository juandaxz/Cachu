'use client'

import { useState, useTransition } from 'react'
import { checkinAntiHabit, uncheckinAntiHabit, deleteAntiHabit } from '@/app/actions/anti-habits'
import { TemptationModal } from './temptation-modal'
import { Heatmap } from '@/components/heatmap'
import { Flame, ShieldCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { AntiHabit, AntiHabitCheckin } from '@/lib/types'
import { differenceInDays, parseISO } from 'date-fns'

const COLORS = ['#7c3aed','#0891b2','#059669','#d97706','#2563eb','#db2777','#ea580c','#0f766e']
function getColor(id: string): string {
  return COLORS[parseInt(id.slice(-1), 16) % COLORS.length]
}

const SNAP_OPEN = -80

interface Props {
  antiHabit: AntiHabit
  checkins: AntiHabitCheckin[]
  streak: number
  checkedToday: boolean
}

export function AntiHabitCard({ antiHabit, checkins, streak, checkedToday }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [swipeX, setSwipeX] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [cardXAtTouchStart, setCardXAtTouchStart] = useState(0)
  const [activeSwiping, setActiveSwiping] = useState(false)

  const color = getColor(antiHabit.id)
  const totalDays = differenceInDays(new Date(), parseISO(antiHabit.start_date)) + 1
  const checkinMap: Record<string, number> = {}
  checkins.forEach((c) => { checkinMap[c.date] = 1 })

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) await uncheckinAntiHabit(antiHabit.id)
      else await checkinAntiHabit(antiHabit.id)
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
          onClick={() => startTransition(() => deleteAntiHabit(antiHabit.id))}
          className="flex flex-col items-center gap-1"
        >
          <Trash2 className="h-5 w-5 text-white" />
          <span className="text-white text-[10px] font-medium">Delete</span>
        </button>
      </div>

      {/* Main card */}
      <div
        className={`relative rounded-2xl ${!activeSwiping ? 'transition-transform duration-200' : ''} ${isPending ? 'opacity-60' : ''}`}
        style={{ backgroundColor: color, transform: `translateX(${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              {antiHabit.emoji || antiHabit.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-base leading-tight">{antiHabit.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Flame className="h-3 w-3" /> {streak} day streak
                </span>
                <span className="text-white/60 text-xs">{totalDays} total days</span>
              </div>
            </div>
            <button
              onClick={() => swipeX !== 0 ? setSwipeX(0) : setExpanded(!expanded)}
              className="sm:hidden p-1.5 rounded-lg bg-white/20 text-white"
            >
              {expanded && swipeX === 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/35 transition-colors">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button onClick={() => { if (confirm('Delete?')) startTransition(() => deleteAntiHabit(antiHabit.id)) }} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-400/60 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: streak, label: 'Current streak' },
              { value: totalDays, label: 'Total days' },
              { value: checkins.length, label: 'Check-ins' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl bg-white/15 p-2 text-center">
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[11px] text-white/70">{label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                checkedToday ? 'bg-white text-gray-800' : 'bg-white/20 text-white border border-white/30'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {checkedToday ? 'Marked clean today' : 'Mark today as clean'}
            </button>
            <TemptationModal antiHabit={antiHabit} streak={streak} />
          </div>
        </div>

        {expanded && swipeX === 0 && (
          <div className="px-4 pb-4">
            <div className="border-t border-white/20 pt-3">
              <Heatmap valueMap={checkinMap} label="Clean days" compact />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
