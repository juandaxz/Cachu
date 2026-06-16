import { createClient } from '@/lib/supabase/server'
import { fetchCalendarEvents } from '@/lib/ical'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { CalendarView, type UnifiedEvent } from '@/components/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profileResult, todosResult] = await Promise.all([
    supabase.from('profiles').select('ical_url').eq('id', user.id).single(),
    supabase.from('todos').select('id, title, deadline, urgency, status').neq('status', 'done').not('deadline', 'is', null),
  ])

  const profile = profileResult.data
  const todos = todosResult.data ?? []

  const events: UnifiedEvent[] = []
  let fetchError = ''
  const hasIcal = !!profile?.ical_url

  if (hasIcal) {
    try {
      const icalEvents = await fetchCalendarEvents(profile!.ical_url!)
      for (const e of icalEvents) {
        events.push({
          id: e.uid,
          title: e.title,
          date: format(e.start, 'yyyy-MM-dd'),
          time: format(e.start, 'HH:mm'),
          type: 'ical',
          url: e.url || undefined,
          courseName: e.courseName || undefined,
        })
      }
    } catch {
      fetchError = 'No se pudo cargar el calendario del Aula Virtual. Verifica el URL en configuración.'
    }
  }

  for (const todo of todos) {
    if (todo.deadline) {
      const d = new Date(todo.deadline)
      events.push({
        id: todo.id,
        title: todo.title,
        date: format(d, 'yyyy-MM-dd'),
        time: format(d, 'HH:mm') !== '00:00' ? format(d, 'HH:mm') : undefined,
        type: 'todo',
        urgency: todo.urgency,
        status: todo.status,
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          {!hasIcal && (
            <p className="text-sm text-muted-foreground">
              <Link href="/settings" className="text-primary underline underline-offset-2">
                Conecta tu Aula Virtual
              </Link>{' '}
              para ver tus clases aquí
            </p>
          )}
        </div>
        <Link href="/settings" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Configurar
        </Link>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {events.length === 0 && !fetchError && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">Sin eventos en el calendario</p>
          <p className="text-sm text-muted-foreground">
            Agrega deadlines a tus tareas o conecta el Aula Virtual para ver eventos aquí.
          </p>
        </div>
      )}

      {(events.length > 0 || hasIcal) && (
        <CalendarView events={events} hasIcal={hasIcal} />
      )}
    </div>
  )
}
