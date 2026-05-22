import { createClient } from '@/lib/supabase/server'
import { today, buildAntiCheckinSet, calcAntiHabitStreak } from '@/lib/utils'
import { AntiHabitForm } from '@/components/anti-habits/anti-habit-form'
import { AntiHabitCard } from '@/components/anti-habits/anti-habit-card'

export default async function AntiHabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: antiHabits } = await supabase
    .from('anti_habits')
    .select('*, anti_habit_checkins(id, date, created_at)')
    .eq('user_id', user.id)
    .order('created_at')

  const todayStr = today()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits to quit</h1>
          <p className="text-sm text-muted-foreground">Your clean streak</p>
        </div>
        <AntiHabitForm />
      </div>

      {(!antiHabits || antiHabits.length === 0) ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">No habits to quit yet. Add one.</p>
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
    </div>
  )
}
