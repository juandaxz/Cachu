import { createClient } from '@/lib/supabase/server'
import { buildCheckinMap, buildYearGrid, calcHabitStreak, calcAntiHabitStreak } from '@/lib/utils'
import { Heatmap } from '@/components/heatmap'
import { Flame } from 'lucide-react'
import { format } from 'date-fns'

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [habitsRes, antiHabitsRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*, habit_checkins(date, value)')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at'),
    supabase
      .from('anti_habits')
      .select('*, anti_habit_checkins(date)')
      .eq('user_id', user.id)
      .order('created_at'),
  ])

  const habits = habitsRes.data ?? []
  const antiHabits = antiHabitsRes.data ?? []

  // Build global heatmap: value = number of habits completed that day
  const allDatesMap: Record<string, number> = {}
  habits.forEach((habit) => {
    const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
    Object.keys(checkinMap).forEach((date) => {
      allDatesMap[date] = (allDatesMap[date] ?? 0) + 1
    })
  })

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
        <p className="text-sm text-muted-foreground">Tu progreso del último año</p>
      </div>

      {/* Global habit heatmap */}
      {habits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Actividad general de hábitos</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <Heatmap
              valueMap={allDatesMap}
              maxValue={Math.max(habits.length, 1)}
              label={`Intensidad = cuántos de tus ${habits.length} hábitos completaste ese día`}
            />
          </div>
          {/* Per-habit summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habits.map((habit) => {
              const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
              const streak = calcHabitStreak(habit.habit_checkins ?? [])
              const total = Object.keys(checkinMap).length
              return (
                <div key={habit.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{habit.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-orange-400 flex items-center gap-1"><Flame className="h-3 w-3" />{streak} racha</span>
                        <span>· {total} días totales</span>
                      </div>
                    </div>
                  </div>
                  <Heatmap valueMap={checkinMap} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Anti-habit heatmaps */}
      {antiHabits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Rachas de hábitos a dejar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {antiHabits.map((ah) => {
              const checkinMap: Record<string, number> = {}
              ;(ah.anti_habit_checkins ?? []).forEach((c: { date: string }) => {
                checkinMap[c.date] = 1
              })
              const streak = calcAntiHabitStreak(ah.anti_habit_checkins ?? [], ah.start_date)
              const totalCheckins = (ah.anti_habit_checkins ?? []).length
              return (
                <div key={ah.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ah.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ah.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-orange-400 flex items-center gap-1"><Flame className="h-3 w-3" />{streak} racha</span>
                        <span>· {totalCheckins} check-ins</span>
                      </div>
                    </div>
                  </div>
                  <Heatmap valueMap={checkinMap} label="Días limpio" />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {habits.length === 0 && antiHabits.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📊</p>
          <p className="text-muted-foreground">Sin datos aún. Agrega hábitos y empieza a hacer check-in.</p>
        </div>
      )}
    </div>
  )
}
