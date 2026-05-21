import { createClient } from '@/lib/supabase/server'
import { ensureDefaultCategories } from '@/app/actions/todos'
import { TodoForm } from '@/components/todos/todo-form'
import { TodoItem } from '@/components/todos/todo-item'
import { TodoKanban } from '@/components/todos/todo-kanban'
import { TodoFilters } from '@/components/todos/todo-filters'
import { Suspense } from 'react'
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

  const [todosRes, categoriesRes] = await Promise.all([
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
  ])

  let todos = todosRes.data ?? []
  const categories = categoriesRes.data ?? []

  // Apply filters
  if (urgencyFilter) todos = todos.filter((t) => t.urgency === urgencyFilter)
  if (categoryFilter) todos = todos.filter((t) => t.category_id === categoryFilter)
  if (statusFilter) todos = todos.filter((t) => t.status === statusFilter)
  else if (view === 'list') todos = todos.filter((t) => t.status !== 'done')

  // Sort by urgency priority
  const urgencyOrder = { risk: 0, high: 1, medium: 2, low: 3 }
  todos.sort((a, b) => (urgencyOrder[a.urgency as Urgency] ?? 3) - (urgencyOrder[b.urgency as Urgency] ?? 3))

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-sm text-muted-foreground">{todos.length} tarea{todos.length !== 1 ? 's' : ''}</p>
        </div>
        <TodoForm categories={categories} />
      </div>

      <Suspense>
        <TodoFilters categories={categories} currentView={view} />
      </Suspense>

      {todos.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">✅</p>
          <p className="text-muted-foreground">Sin tareas pendientes. ¡Todo al día!</p>
        </div>
      ) : view === 'kanban' ? (
        <TodoKanban todos={todos} />
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
        </div>
      )}
    </div>
  )
}
