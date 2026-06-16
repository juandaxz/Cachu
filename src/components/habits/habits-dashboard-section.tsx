'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buildCheckinMap, calcHabitStreak, today } from '@/lib/utils'
import { DashboardHabitCard } from './dashboard-habit-card'
import type { HabitWithCheckins } from '@/lib/types'

interface Props {
  habits: HabitWithCheckins[]
}

export function HabitsDashboardSection({ habits }: Props) {
  const todayStr = today()

  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hábitos</h2>
        <Link
          href="/habits"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-1.5">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sin hábitos aún.</p>
        ) : (
          habits.map((habit) => {
            const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
            const checkedToday = todayStr in checkinMap
            const streak = calcHabitStreak(habit.habit_checkins ?? [])
            return (
              <DashboardHabitCard
                key={habit.id}
                habit={habit}
                checkedToday={checkedToday}
                todayValue={checkinMap[todayStr] ?? 0}
                streak={streak}
              />
            )
          })
        )}
      </div>
    </section>
  )
}
