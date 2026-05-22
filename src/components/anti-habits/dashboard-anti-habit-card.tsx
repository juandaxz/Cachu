'use client'

import { useTransition } from 'react'
import { checkinAntiHabit, uncheckinAntiHabit } from '@/app/actions/anti-habits'
import { TemptationModal } from './temptation-modal'
import { Flame, ShieldCheck } from 'lucide-react'
import type { AntiHabit } from '@/lib/types'

const COLORS = ['#7c3aed','#0891b2','#059669','#d97706','#2563eb','#db2777','#ea580c','#0f766e']
function getColor(id: string): string {
  return COLORS[parseInt(id.slice(-1), 16) % COLORS.length]
}

interface Props {
  antiHabit: AntiHabit
  checkedToday: boolean
  streak: number
  cleanDays: string
}

export function DashboardAntiHabitCard({ antiHabit, checkedToday, streak, cleanDays }: Props) {
  const [isPending, startTransition] = useTransition()
  const color = getColor(antiHabit.id)

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) await uncheckinAntiHabit(antiHabit.id)
      else await checkinAntiHabit(antiHabit.id)
    })
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-3 transition-opacity ${isPending ? 'opacity-60' : ''}`}
      style={{ backgroundColor: color }}
    >
      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-all ${
          checkedToday ? 'bg-white text-gray-800' : 'bg-white/25 text-white'
        }`}
      >
        {checkedToday
          ? <ShieldCheck className="h-5 w-5" />
          : <span className="text-sm font-bold">{antiHabit.emoji || antiHabit.name.charAt(0).toUpperCase()}</span>
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{antiHabit.name}</p>
        <p className="text-xs text-white/70 flex items-center gap-1">
          <Flame className="h-3 w-3" /> {streak} days · {cleanDays} clean
        </p>
      </div>

      <TemptationModal antiHabit={antiHabit} streak={streak} />
    </div>
  )
}
