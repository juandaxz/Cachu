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
      if (checkedToday) await uncheckinAntiHabit(antiHabit.id)
      else await checkinAntiHabit(antiHabit.id)
    })
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-base">
        {antiHabit.emoji || antiHabit.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{antiHabit.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Flame className="h-3 w-3 text-primary" /> {streak} días · {cleanDays} limpio
        </p>
      </div>

      <button
        onClick={handleCheck}
        disabled={isPending}
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all border-2 ${
          checkedToday
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-transparent border-border text-muted-foreground hover:border-primary hover:text-primary'
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
      </button>

      <TemptationModal antiHabit={antiHabit} streak={streak} />
    </div>
  )
}
