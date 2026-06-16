import { createClient } from '@/lib/supabase/server'
import { today, buildCheckinMap, calcHabitStreak, buildAntiCheckinSet, calcAntiHabitStreak, cn } from '@/lib/utils'
import { HabitForm } from '@/components/habits/habit-form'
import { HabitCard } from '@/components/habits/habit-card'
import { AntiHabitForm } from '@/components/anti-habits/anti-habit-form'
import { AntiHabitCard } from '@/components/anti-habits/anti-habit-card'
import Link from 'next/link'

export default async function HabitsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const params = await searchParams
  const tab = params.tab === 'dejar' ? 'dejar' : 'positivos'
  const todayStr = today()

  const [habitsRes, antiHabitsRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*, habit_checkins(date, value)')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at'),
    supabase
      .from('anti_habits')
      .select('*, anti_habit_checkins(id, date, created_at)')
      .eq('user_id', user.id)
      .order('created_at'),
  ])

  const habits = habitsRes.data ?? []
  const antiHabits = antiHabitsRes.data ?? []

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Hábitos</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-secondary p-1 w-fit">
        <Link
          href="/habits?tab=positivos"
          className={cn(
            'rounded-md px-5 py-1.5 text-sm font-medium transition-colors',
            tab === 'positivos' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Positivos
        </Link>
        <Link
          href="/habits?tab=dejar"
          className={cn(
            'rounded-md px-5 py-1.5 text-sm font-medium transition-colors',
            tab === 'dejar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          A dejar
        </Link>
      </div>

      {tab === 'positivos' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Hábitos positivos que quieres construir</p>
            <HabitForm />
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Sin hábitos aún. Agrega el primero.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const checkinMap = buildCheckinMap(habit.habit_checkins ?? [])
                const streak = calcHabitStreak(habit.habit_checkins ?? [])
                const checkedToday = todayStr in checkinMap
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    checkinMap={checkinMap}
                    streak={streak}
                    checkedToday={checkedToday}
                    todayValue={checkinMap[todayStr] ?? 0}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {tab === 'dejar' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Tu racha de días sin el hábito</p>
            <AntiHabitForm />
          </div>

          {antiHabits.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Sin hábitos que dejar aún. Agrega uno.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {antiHabits.map((ah) => {
                const checkedSet = buildAntiCheckinSet(ah.anti_habit_checkins ?? [])
                const checkedToday = checkedSet.has(todayStr)
                const streak = calcAntiHabitStreak(ah.anti_habit_checkins ?? [], ah.start_date)
                return (
                  <AntiHabitCard
                    key={ah.id}
                    antiHabit={ah}
                    checkins={ah.anti_habit_checkins ?? []}
                    streak={streak}
                    checkedToday={checkedToday}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
