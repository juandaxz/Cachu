import { createClient } from '@/lib/supabase/server'
import { today, calcAntiHabitStreak, formatDuration, buildAntiCheckinSet } from '@/lib/utils'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import { HabitsDashboardSection } from '@/components/habits/habits-dashboard-section'
import { DashboardAntiHabitCard } from '@/components/anti-habits/dashboard-anti-habit-card'
import { DashboardTodoItem } from '@/components/todos/dashboard-todo-item'
import { fetchCalendarEvents, upcomingEvents } from '@/lib/ical'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ExternalLink, Clock } from 'lucide-react'
import { Greeting } from '@/components/greeting'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const todayStr = today()

  const profileRes = await supabase.from('profiles').select('ical_url').eq('id', user.id).single()
  const icalUrl = profileRes.data?.ical_url

  let calendarEvents: Awaited<ReturnType<typeof upcomingEvents>> = []
  if (icalUrl) {
    try {
      const all = await fetchCalendarEvents(icalUrl)
      calendarEvents = upcomingEvents(all, 7)
    } catch {
      // silently ignore calendar errors on home
    }
  }

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
      .order('created_at', { ascending: false }),
  ])

  const habits = habitsRes.data ?? []
  const antiHabits = antiHabitsRes.data ?? []

  const urgencyOrder: Record<string, number> = { risk: 0, high: 1, medium: 2, low: 3 }
  const statusOrder: Record<string, number> = { pending: 0, in_progress: 1, done: 2 }
  const todos = (todosRes.data ?? []).sort((a, b) => {
    const sd = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
    if (sd !== 0) return sd
    return (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3)
  })

  const dayLabel = format(new Date(), 'EEEE, MMMM d')

  const totalHabits = habits.length
  const checkedToday = habits.filter((h) => h.habit_checkins?.some((c: { date: string }) => c.date === todayStr)).length
  const pendingTodos = todos.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-sm capitalize">{dayLabel}</p>
        <Greeting />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{checkedToday}/{totalHabits}</p>
          <p className="text-xs text-muted-foreground mt-1">Hábitos hoy</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{antiHabits.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Bajo control</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{pendingTodos}</p>
          <p className="text-xs text-muted-foreground mt-1">Tareas pendientes</p>
        </div>
      </div>

      {/* Habits check-in */}
      {habits.length > 0 && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <HabitsDashboardSection habits={habits as any} />
      )}

      {/* Anti-habits check-in */}
      {antiHabits.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Rachas activas</h2>
            <Link href="/anti-habits" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
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

      {/* Todos */}
      {todos.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Tareas</h2>
            <Link href="/todos" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {todos.filter((t) => t.status !== 'done').slice(0, 5).map((todo) => (
              <DashboardTodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </section>
      )}

      {/* Calendar upcoming */}
      {calendarEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Próximas entregas
            </h2>
            <Link href="/calendar" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {calendarEvents.slice(0, 5).map((event) => {
              let dateLabel: string
              if (isToday(event.start)) dateLabel = 'Hoy'
              else if (isTomorrow(event.start)) dateLabel = 'Mañana'
              else dateLabel = format(event.start, "EEE d MMM", { locale: es })
              return (
                <div key={event.uid} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <div className="shrink-0 text-center min-w-[44px]">
                    <p className="text-[10px] text-muted-foreground uppercase leading-none">{dateLabel}</p>
                    <p className="text-sm font-semibold text-primary flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />{format(event.start, 'HH:mm')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    {event.courseName && <p className="text-xs text-muted-foreground truncate">{event.courseName}</p>}
                  </div>
                  {event.url && (
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {habits.length === 0 && antiHabits.length === 0 && todos.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">Nada por aquí. Empieza agregando hábitos o tareas.</p>
        </div>
      )}
    </div>
  )
}
