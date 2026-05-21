import { createClient } from '@/lib/supabase/server'
import { today, calcHabitStreak, calcAntiHabitStreak, formatDuration, buildCheckinMap, buildAntiCheckinSet, URGENCY_CONFIG } from '@/lib/utils'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { DashboardHabitCard } from '@/components/habits/dashboard-habit-card'
import { DashboardAntiHabitCard } from '@/components/anti-habits/dashboard-anti-habit-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const todayStr = today()

  // Fetch all data in parallel
  const [habitsRes, antiHabitsRes, todosRes] = await Promise.all([
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
    supabase
      .from('todos')
      .select('*, todo_categories(name, color)')
      .eq('user_id', user.id)
      .neq('status', 'done')
      .order('urgency', { ascending: false })
      .limit(5),
  ])

  const habits = habitsRes.data ?? []
  const antiHabits = antiHabitsRes.data ?? []
  const todos = todosRes.data ?? []

  const dayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
  const dayLabelCapitalized = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)

  // Stats
  const totalHabits = habits.length
  const checkedToday = habits.filter((h) => h.habit_checkins?.some((c: { date: string }) => c.date === todayStr)).length
  const pendingTodos = todos.filter((t) => t.status !== 'done').length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-sm">{dayLabelCapitalized}</p>
        <h1 className="text-2xl font-bold text-foreground">Buenos días 👋</h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{checkedToday}/{totalHabits}</p>
          <p className="text-xs text-muted-foreground mt-1">Hábitos hoy</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{antiHabits.length}</p>
          <p className="text-xs text-muted-foreground mt-1">En control</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingTodos}</p>
          <p className="text-xs text-muted-foreground mt-1">Tareas pendientes</p>
        </div>
      </div>

      {/* Habits check-in */}
      {habits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Hábitos de hoy</h2>
            <Link href="/habits" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
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
        </section>
      )}

      {/* Anti-habits check-in */}
      {antiHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Rachas activas</h2>
            <Link href="/anti-habits" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {antiHabits.map((ah) => {
              const checkedSet = buildAntiCheckinSet(ah.anti_habit_checkins ?? [])
              const checkedToday = checkedSet.has(todayStr)
              const streak = calcAntiHabitStreak(ah.anti_habit_checkins ?? [], ah.start_date)
              return (
                <DashboardAntiHabitCard
                  key={ah.id}
                  antiHabit={ah}
                  checkedToday={checkedToday}
                  streak={streak}
                  cleanDays={formatDuration(ah.start_date)}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Urgent todos */}
      {todos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Tareas pendientes</h2>
            <Link href="/todos" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todos.map((todo) => {
              const urgency = URGENCY_CONFIG[todo.urgency as keyof typeof URGENCY_CONFIG]
              const isOverdue = todo.deadline && isPast(parseISO(todo.deadline)) && !isToday(parseISO(todo.deadline))
              return (
                <div key={todo.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                  <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${urgency.color}`}>
                    {urgency.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{todo.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {todo.todo_categories && (
                        <span className="text-xs text-muted-foreground" style={{ color: todo.todo_categories.color }}>
                          {todo.todo_categories.name}
                        </span>
                      )}
                      {todo.deadline && (
                        <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {isOverdue ? '⚠️ ' : ''}{format(parseISO(todo.deadline), 'd MMM', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {habits.length === 0 && antiHabits.length === 0 && todos.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🐠</p>
          <p className="text-muted-foreground">Todo vacío. ¡Empieza agregando hábitos o tareas!</p>
        </div>
      )}
    </div>
  )
}
