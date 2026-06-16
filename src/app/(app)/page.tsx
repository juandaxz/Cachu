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
      // silently ignore
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

  // Spanish date in Ecuador timezone: "martes, 16 jun"
  const dayLabel = new Intl.DateTimeFormat('es', {
    timeZone: 'America/Guayaquil',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date())

  const totalHabits = habits.length
  const checkedToday = habits.filter((h) => h.habit_checkins?.some((c: { date: string }) => c.date === todayStr)).length
  const pendingTodos = todos.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  return (
    <div className="space-y-3 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-0.5">
        <p className="text-muted-foreground text-xs capitalize">{dayLabel}</p>
        <Greeting />
      </div>

      {/* Quick stats — flex to avoid grid overflow on narrow screens */}
      <div className="flex rounded-xl border border-border bg-card divide-x divide-border overflow-hidden">
        <div className="flex-1 py-2.5 px-2 text-center min-w-0">
          <p className="text-lg font-bold text-primary tabular-nums">{checkedToday}/{totalHabits}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Hábitos</p>
        </div>
        <div className="flex-1 py-2.5 px-2 text-center min-w-0">
          <p className="text-lg font-bold text-primary tabular-nums">{antiHabits.length}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Control</p>
        </div>
        <div className="flex-1 py-2.5 px-2 text-center min-w-0">
          <p className="text-lg font-bold text-primary tabular-nums">{pendingTodos}</p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Pendientes</p>
        </div>
      </div>

      {/* Habits check-in */}
      {habits.length > 0 && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <HabitsDashboardSection habits={habits as any} />
      )}

      {/* Anti-habits */}
      {antiHabits.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rachas activas</h2>
            <Link href="/habits?tab=dejar" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
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
      {todos.filter((t) => t.status !== 'done').length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tareas</h2>
            <Link href="/todos" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {todos.filter((t) => t.status !== 'done').slice(0, 5).map((todo) => (
              <DashboardTodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </section>
      )}

      {/* Calendar upcoming */}
      {calendarEvents.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Próximas entregas
            </h2>
            <Link href="/todos?view=calendar" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {calendarEvents.slice(0, 4).map((event) => {
              const dateLabel = isToday(event.start) ? 'Hoy'
                : isTomorrow(event.start) ? 'Mañana'
                : format(event.start, "EEE d", { locale: es })
              return (
                <div key={event.uid} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                  <div className="shrink-0 text-center w-10">
                    <p className="text-[9px] text-muted-foreground uppercase leading-none">{dateLabel}</p>
                    <p className="text-[10px] font-semibold text-primary flex items-center gap-0.5 mt-0.5 justify-center">
                      <Clock className="h-2 w-2" />{format(event.start, 'HH:mm')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
                    {event.courseName && <p className="text-[10px] text-muted-foreground truncate">{event.courseName}</p>}
                  </div>
                  {event.url && (
                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-3 w-3" />
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
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Nada por aquí. Agrega hábitos o tareas.</p>
        </div>
      )}
    </div>
  )
}
