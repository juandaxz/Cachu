import { createClient } from '@/lib/supabase/server'
import { buildCheckinMap, calcHabitStreak, calcAntiHabitStreak } from '@/lib/utils'
import { Heatmap } from '@/components/heatmap'
import { Flame } from 'lucide-react'

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
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <p className="text-sm text-muted-foreground">Your progress over the past year</p>
      </div>

      {habits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overall habit activity</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <Heatmap
              valueMap={allDatesMap}
              maxValue={Math.max(habits.length, 1)}
              label={`Intensity: how many of your ${habits.length} habits you completed that day`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {habits.map((habit) => {
              const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
              const streak = calcHabitStreak(habit.habit_checkins ?? [])
              const total = Object.keys(checkinMap).length
              return (
                <div key={habit.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md shrink-0" style={{ backgroundColor: habit.color }} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{habit.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-orange-400 flex items-center gap-1"><Flame className="h-3 w-3" />{streak} streak</span>
                        <span>· {total} total days</span>
                      </div>
                    </div>
                  </div>
                  <Heatmap valueMap={checkinMap} compact />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {antiHabits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quit habit streaks</h2>
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
                    <div className="h-6 w-6 rounded-md shrink-0 bg-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{ah.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="text-orange-400 flex items-center gap-1"><Flame className="h-3 w-3" />{streak} streak</span>
                        <span>· {totalCheckins} check-ins</span>
                      </div>
                    </div>
                  </div>
                  <Heatmap valueMap={checkinMap} label="Clean days" compact />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {habits.length === 0 && antiHabits.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">No data yet. Add habits and start checking in.</p>
        </div>
      )}
    </div>
  )
}
