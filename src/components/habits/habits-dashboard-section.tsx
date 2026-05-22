'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, subDays } from 'date-fns'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buildCheckinMap, calcHabitStreak, today } from '@/lib/utils'
import { DashboardHabitCard } from './dashboard-habit-card'
import type { HabitWithCheckins } from '@/lib/types'

type Tab = 'today' | 'weekly' | 'overall'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const OVERALL_WEEKS = 16

interface Props {
  habits: HabitWithCheckins[]
}

export function HabitsDashboardSection({ habits }: Props) {
  const [tab, setTab] = useState<Tab>('today')
  const todayStr = today()
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  )

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Habits</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border text-xs">
            {(['today', 'weekly', 'overall'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 transition-colors ${
                  tab === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'weekly' ? 'Week' : 'Overall'}
              </button>
            ))}
          </div>
          <Link
            href="/habits"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {tab === 'today' && (
        <div className="space-y-2">
          {habits.map((habit) => {
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
          })}
        </div>
      )}

      {tab === 'weekly' && (
        <div className="space-y-2">
          {habits.map((habit) => {
            const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
            return (
              <WeeklyHabitRow
                key={habit.id}
                habit={habit}
                weekDays={weekDays}
                checkinMap={checkinMap}
                todayStr={todayStr}
              />
            )
          })}
        </div>
      )}

      {tab === 'overall' && (
        <div className="space-y-2">
          {habits.map((habit) => {
            const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
            return (
              <OverallHabitRow
                key={habit.id}
                habit={habit}
                checkinMap={checkinMap}
                todayStr={todayStr}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

interface WeeklyProps {
  habit: HabitWithCheckins
  weekDays: string[]
  checkinMap: Record<string, number>
  todayStr: string
}

function WeeklyHabitRow({ habit, weekDays, checkinMap, todayStr }: WeeklyProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2">
        {habit.emoji
          ? <span className="text-base">{habit.emoji}</span>
          : <div className="h-5 w-5 rounded-md shrink-0" style={{ backgroundColor: habit.color }} />
        }
        <span className="text-sm font-medium text-foreground">{habit.name}</span>
      </div>
      <div className="flex gap-1">
        {weekDays.map((date, i) => {
          const isChecked = date in checkinMap
          const isToday = date === todayStr
          const isFuture = date > todayStr
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-medium ${
                  isToday ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                  isFuture
                    ? 'bg-secondary/30'
                    : isChecked
                    ? ''
                    : isToday
                    ? 'border-2 border-primary/60'
                    : 'border-2 border-border'
                }`}
                style={isChecked ? { backgroundColor: habit.color } : undefined}
              >
                {isChecked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface OverallProps {
  habit: HabitWithCheckins
  checkinMap: Record<string, number>
  todayStr: string
}

function OverallHabitRow({ habit, checkinMap, todayStr }: OverallProps) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const gridStart = subDays(weekStart, (OVERALL_WEEKS - 1) * 7)

  const grid: string[][] = Array.from({ length: 7 }, () => [])
  for (let week = 0; week < OVERALL_WEEKS; week++) {
    for (let day = 0; day < 7; day++) {
      const date = format(addDays(gridStart, week * 7 + day), 'yyyy-MM-dd')
      grid[day].push(date)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2">
        {habit.emoji
          ? <span className="text-base">{habit.emoji}</span>
          : <div className="h-5 w-5 rounded-md shrink-0" style={{ backgroundColor: habit.color }} />
        }
        <span className="text-sm font-medium text-foreground">{habit.name}</span>
      </div>
      <div className="space-y-[3px]">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-[3px]">
            {row.map((date) => {
              const isChecked = date in checkinMap
              const isFuture = date > todayStr
              return (
                <div
                  key={date}
                  className="flex-1 h-[10px] rounded-full"
                  style={{
                    backgroundColor: isFuture
                      ? 'transparent'
                      : isChecked
                      ? habit.color
                      : `${habit.color}40`,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
