import { createClient } from '@/lib/supabase/server'
import { fetchCalendarEvents } from '@/lib/ical'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('ical_url')
    .eq('id', user.id)
    .single()

  if (!profile?.ical_url) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
          <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">No has conectado tu calendario</p>
          <p className="text-sm text-muted-foreground">
            Ve a{' '}
            <Link href="/settings" className="text-primary underline underline-offset-2">
              Configuración
            </Link>{' '}
            y pega tu URL de calendario del Aula Virtual.
          </p>
        </div>
      </div>
    )
  }

  let events: Awaited<ReturnType<typeof fetchCalendarEvents>> = []
  let fetchError = ''

  try {
    events = await fetchCalendarEvents(profile.ical_url)
  } catch {
    fetchError = 'No se pudo cargar el calendario. Verifica que el URL sea válido.'
  }

  const now = new Date()
  const upcoming = events.filter((e) => e.start >= now)
  const past = events.filter((e) => e.start < now).reverse().slice(0, 10)

  // Group upcoming by date label
  const grouped: Record<string, typeof upcoming> = {}
  for (const event of upcoming) {
    let label: string
    if (isToday(event.start)) label = 'Hoy'
    else if (isTomorrow(event.start)) label = 'Mañana'
    else label = format(event.start, "EEEE d 'de' MMMM", { locale: es })
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(event)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground">{upcoming.length} actividades pendientes</p>
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

      {Object.keys(grouped).length === 0 && !fetchError && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay actividades próximas.</p>
        </div>
      )}

      {Object.entries(grouped).map(([label, dayEvents]) => (
        <section key={label} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{label}</h2>
          <div className="space-y-2">
            {dayEvents.map((event) => {
              const overdue = isPast(event.start) && !isToday(event.start)
              return (
                <div key={event.uid} className="rounded-xl border border-border bg-card px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground leading-snug">{event.title}</p>
                    {event.url && (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={overdue ? 'text-destructive font-medium' : ''}>
                        {format(event.start, 'HH:mm')}
                      </span>
                    </span>
                    {event.courseName && <span>{event.courseName}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {past.length > 0 && (
        <section className="space-y-2 opacity-50">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recientes</h2>
          <div className="space-y-2">
            {past.map((event) => (
              <div key={event.uid} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground line-through">{event.title}</p>
                <p className="text-xs text-muted-foreground">{format(event.start, "d MMM, HH:mm", { locale: es })}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
