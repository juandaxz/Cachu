'use client'

import { useState, useTransition } from 'react'
import { checkinAntiHabit, uncheckinAntiHabit, deleteAntiHabit } from '@/app/actions/anti-habits'
import { TemptationModal } from './temptation-modal'
import { Heatmap } from '@/components/heatmap'
import { Flame, ShieldCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
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
      if (checkedToday) await uncheckinAntiHabit(antiHabit.id)
      else await checkinAntiHabit(antiHabit.id)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAntiHabit(antiHabit.id)
      toast.success('Hábito eliminado')
    })
  }

  return (
    <div className={`bg-card border border-border rounded-xl transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-lg">
            {antiHabit.emoji || antiHabit.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">{antiHabit.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <Flame className="h-3 w-3 text-primary" /> {streak} días seguidos
              </span>
              <span className="text-muted-foreground text-xs">{totalDays} días totales</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <ConfirmDialog
              title="¿Eliminar hábito?"
              description="Se eliminará el hábito y toda su racha. Esta acción no se puede deshacer."
              onConfirm={handleDelete}
              trigger={
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: streak, label: 'Racha actual' },
            { value: totalDays, label: 'Días totales' },
            { value: checkins.length, label: 'Días marcados' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-lg bg-secondary p-2 text-center">
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCheck}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all border ${
              checkedToday
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-foreground border-border hover:bg-secondary'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {checkedToday ? 'Marcado limpio hoy ✓' : 'Marcar hoy como limpio'}
          </button>
          <TemptationModal antiHabit={antiHabit} streak={streak} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <Heatmap valueMap={checkinMap} label="Días limpios" compact />
        </div>
      )}
    </div>
  )
}
