'use client'

import { useState, useTransition } from 'react'
import { checkinAntiHabit, uncheckinAntiHabit, deleteAntiHabit } from '@/app/actions/anti-habits'
import { TemptationModal } from './temptation-modal'
import { Heatmap } from '@/components/heatmap'
import { Flame, ShieldCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { AntiHabit, AntiHabitCheckin } from '@/lib/types'
import { differenceInDays, parseISO } from 'date-fns'

interface Props {
  antiHabit: AntiHabit
  checkins: AntiHabitCheckin[]
  streak: number
  checkedToday: boolean
}

export function AntiHabitCard({ antiHabit, checkins, streak, checkedToday }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalDays = differenceInDays(new Date(), parseISO(antiHabit.start_date)) + 1
  const checkinMap: Record<string, number> = {}
  checkins.forEach((c) => { checkinMap[c.date] = 1 })

  function handleCheck() {
    startTransition(async () => {
      if (checkedToday) {
        await uncheckinAntiHabit(antiHabit.id)
      } else {
        await checkinAntiHabit(antiHabit.id)
      }
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este registro y todo su historial?')) return
    startTransition(() => deleteAntiHabit(antiHabit.id))
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{antiHabit.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{antiHabit.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <Flame className="h-3 w-3" /> {streak} días de racha
              </span>
              <span className="text-xs text-muted-foreground">{totalDays} días en total</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary p-2 text-center">
            <p className="text-lg font-bold text-orange-400">{streak}</p>
            <p className="text-xs text-muted-foreground">Racha actual</p>
          </div>
          <div className="rounded-lg bg-secondary p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{totalDays}</p>
            <p className="text-xs text-muted-foreground">Días totales</p>
          </div>
          <div className="rounded-lg bg-secondary p-2 text-center">
            <p className="text-lg font-bold text-blue-400">{checkins.length}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium border-2 transition-all ${
              checkedToday
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-border hover:border-primary/50 text-foreground'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {checkedToday ? '✓ Hoy marcado como limpio' : 'Marcar hoy como limpio'}
          </button>
          <TemptationModal antiHabit={antiHabit} streak={streak} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <Heatmap valueMap={checkinMap} label="Días limpio" />
        </div>
      )}
    </div>
  )
}
