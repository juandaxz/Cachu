'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Clock, CheckSquare } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isToday, parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Urgency, TodoStatus } from '@/lib/types'

export type UnifiedEvent = {
  id: string
  title: string
  date: string
  time?: string
  type: 'ical' | 'todo'
  urgency?: Urgency
  status?: TodoStatus
  url?: string
  courseName?: string
}

const TODO_COLOR: Record<Urgency, { pill: string; dot: string }> = {
  low:    { pill: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',    dot: 'bg-blue-400' },
  medium: { pill: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-400' },
  high:   { pill: 'bg-orange-500/15 text-orange-700 dark:text-orange-300', dot: 'bg-orange-400' },
  risk:   { pill: 'bg-red-500/15 text-red-700 dark:text-red-300',       dot: 'bg-red-500' },
}

const STATUS_LABEL: Record<TodoStatus, string> = {
  pending:     'Pendiente',
  in_progress: 'En progreso',
  done:        'Hecho',
}

interface CalendarViewProps {
  events: UnifiedEvent[]
  hasIcal: boolean
}

export function CalendarView({ events, hasIcal }: CalendarViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today)
  const [selectedDay, setSelectedDay] = useState<string>(format(today, 'yyyy-MM-dd'))

  const eventsByDate = useMemo(() => {
    const map: Record<string, UnifiedEvent[]> = {}
    for (const event of events) {
      if (!map[event.date]) map[event.date] = []
      map[event.date].push(event)
    }
    return map
  }, [events])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    const days: Date[] = []
    let d = start
    while (d <= end) {
      days.push(d)
      d = addDays(d, 1)
    }
    return days
  }, [currentMonth])

  const selectedEvents = eventsByDate[selectedDay] ?? []

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => { setCurrentMonth(today); setSelectedDay(format(today, 'yyyy-MM-dd')) }}
            className="px-2 py-1 text-xs rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {calendarDays.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const dayEvents = eventsByDate[key] ?? []
          const inMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDay === key
          const todayDay = isToday(day)

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={[
                'bg-card min-h-[80px] p-1.5 text-left transition-colors flex flex-col',
                !inMonth ? 'opacity-30' : '',
                isSelected ? 'ring-1 ring-inset ring-primary/40 bg-primary/5' : 'hover:bg-secondary/40',
              ].join(' ')}
            >
              <span className={[
                'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                todayDay ? 'bg-primary text-primary-foreground' : 'text-foreground',
              ].join(' ')}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map(e => (
                  <span
                    key={e.id}
                    className={[
                      'text-[10px] leading-tight px-1 py-0.5 rounded truncate',
                      e.type === 'ical'
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
                        : TODO_COLOR[e.urgency ?? 'medium'].pill,
                    ].join(' ')}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayEvents.length - 2} más
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {format(parseISO(selectedDay), "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sin eventos este día</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map(event => (
              <div key={event.id} className="rounded-xl border border-border bg-card px-4 py-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={[
                      'shrink-0 w-2 h-2 rounded-full',
                      event.type === 'ical' ? 'bg-sky-500' : TODO_COLOR[event.urgency ?? 'medium'].dot,
                    ].join(' ')} />
                    <p className="text-sm font-medium text-foreground leading-snug">{event.title}</p>
                  </div>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pl-4">
                  {event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  )}
                  {event.courseName && <span>{event.courseName}</span>}
                  {event.type === 'todo' && event.status && (
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      {STATUS_LABEL[event.status]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-1">
        {hasIcal && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Aula Virtual
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Tareas
        </span>
      </div>
    </div>
  )
}
