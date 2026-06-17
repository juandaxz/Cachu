import { createClient } from '@/lib/supabase/server'
import { ensureDefaultCategories } from '@/app/actions/todos'
import { TodoForm } from '@/components/todos/todo-form'
import { TodoItem } from '@/components/todos/todo-item'
import { TodoKanban } from '@/components/todos/todo-kanban'
import { TodoFilters } from '@/components/todos/todo-filters'
import { CalendarView, type UnifiedEvent } from '@/components/calendar-view'
import { fetchCalendarEvents } from '@/lib/ical'
import { Suspense } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Urgency } from '@/lib/types'

interface SearchParams {
  view?: string
  urgency?: string
  category?: string
  status?: string
}

export default async function TodosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await ensureDefaultCategories()

  const params = await searchParams
  const view = params.view ?? 'list'
  const urgencyFilter = params.urgency as Urgency | undefined
  const categoryFilter = params.category
  const statusFilter = params.status

  const [todosRes, categoriesRes, profileRes] = await Promise.all([
    supabase
      .from('todos')
      .select('*, todo_categories(id, name, color)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('todo_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('profiles')
      .select('ical_url')
      .eq('id', user.id)
      .single(),
  ])

  let todos = todosRes.data ?? []
  const categories = categoriesRes.data ?? []
  const profile = profileRes.data

  // Calendar view: build unified events
  let calendarEvents: UnifiedEvent[] = []
  let calendarError = ''
  const hasIcal = !!profile?.ical_url

  if (view === 'calendar') {
    if (hasIcal) {
      try {
        const icalEvents = await fetchCalendarEvents(profile!.ical_url!)
        for (const e of icalEvents) {
          calendarEvents.push({
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
        calendarError = 'No se pudo cargar el Aula Virtual. Verifica el URL en configuración.'
      }
    }
    // Add todos with deadlines to calendar
    for (const todo of todos) {
      if (todo.deadline && todo.status !== 'done') {
        const d = new Date(todo.deadline)
        calendarEvents.push({
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
  }

  // Apply filters (list/kanban views)
  if (urgencyFilter) todos = todos.filter((t) => t.urgency === urgencyFilter)
  if (categoryFilter) todos = todos.filter((t) => t.category_id === categoryFilter)
  if (statusFilter) todos = todos.filter((t) => t.status === statusFilter)
  else if (view === 'list') todos = todos.filter((t) => t.status !== 'done')

  // Sort by urgency priority
  const urgencyOrder = { risk: 0, high: 1, medium: 2, low: 3 }
  todos.sort((a, b) => (urgencyOrder[a.urgency as Urgency] ?? 3) - (urgencyOrder[b.urgency as Urgency] ?? 3))

  return (
    <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Tareas</h1>
          {view !== 'calendar' && (
            <p className="text-sm text-muted-foreground">
              {todos.length} {todos.length === 1 ? 'tarea' : 'tareas'}
            </p>
          )}
        </div>
        {view !== 'calendar' && <TodoForm categories={categories} />}
        {view === 'calendar' && !hasIcal && (
          <Link href="/settings" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Conectar Aula Virtual
          </Link>
        )}
      </div>

      <Suspense fallback={null}>
        <TodoFilters categories={categories} currentView={view} />
      </Suspense>

      {view === 'calendar' ? (
        <>
          {calendarError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {calendarError}
            </div>
          )}
          <CalendarView events={calendarEvents} hasIcal={hasIcal} />
        </>
      ) : todos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Sin tareas pendientes. ¡Todo al día!</p>
        </div>
      ) : view === 'kanban' ? (
        <TodoKanban todos={todos} />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => <TodoItem key={todo.id} todo={todo} categories={categories} />)}
        </div>
      )}
    </div>
  )
}
