import { createClient } from '@/lib/supabase/server'
import { today, buildCheckinMap, calcHabitStreak } from '@/lib/utils'
import { HabitForm } from '@/components/habits/habit-form'
import { HabitCard } from '@/components/habits/habit-card'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: habits } = await supabase
    .from('habits')
    .select('*, habit_checkins(date, value)')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at')

  const todayStr = today()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hábitos</h1>
          <p className="text-sm text-muted-foreground">Hábitos positivos que quieres construir</p>
        </div>
        <HabitForm />
      </div>

      {(!habits || habits.length === 0) ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🎯</p>
          <p className="text-muted-foreground">Sin hábitos aún. ¡Agrega el primero!</p>
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
    </div>
  )
}
