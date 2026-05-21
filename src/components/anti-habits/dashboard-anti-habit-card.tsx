'use client'

import { useTransition } from 'react'
import { checkinAntiHabit, uncheckinAntiHabit } from '@/app/actions/anti-habits'
import { TemptationModal } from './temptation-modal'
import { Flame, ShieldCheck } from 'lucide-react'
import type { AntiHabit } from '@/lib/types'

interface Props {
  antiHabit: AntiHabit
  checkedToday: boolean
  streak: number
  cleanDays: string
}

export function DashboardAntiHabitCard({ antiHabit, checkedToday, streak, cleanDays }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) {
        await uncheckinAntiHabit(antiHabit.id)
      } else {
        await checkinAntiHabit(antiHabit.id)
      }
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-8 w-8 shrink-0 rounded-lg border-2 flex items-center justify-center text-base transition-all ${
          checkedToday
            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
            : 'border-border bg-transparent hover:border-primary/50'
        }`}
      >
        {checkedToday ? <ShieldCheck className="h-4 w-4" /> : antiHabit.emoji}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{antiHabit.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-400" />
          <span className="text-orange-400">{streak} días de racha</span>
          <span className="text-muted-foreground">· {cleanDays} limpio</span>
        </p>
      </div>

      <TemptationModal antiHabit={antiHabit} streak={streak} />
    </div>
  )
}
