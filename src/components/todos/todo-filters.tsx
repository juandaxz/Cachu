'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { URGENCY_CONFIG } from '@/lib/utils'
import { LayoutList, Kanban, CalendarDays } from 'lucide-react'
import type { TodoCategory } from '@/lib/types'

interface Props {
  categories: TodoCategory[]
  currentView: string
}

export function TodoFilters({ categories, currentView }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/todos?${params.toString()}`)
  }

  const urgency = searchParams.get('urgency')
  const category = searchParams.get('category')
  const status = searchParams.get('status')

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => update('view', 'list')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentView !== 'kanban' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          <LayoutList className="h-4 w-4" />
          Lista
        </button>
        <button
          onClick={() => update('view', 'kanban')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentView === 'kanban' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          <Kanban className="h-4 w-4" />
          Kanban
        </button>
        <button
          onClick={() => update('view', 'calendar')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentView === 'calendar' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          <CalendarDays className="h-4 w-4" />
          Calendario
        </button>

        {currentView !== 'kanban' && currentView !== 'calendar' && (
          <button
            onClick={() => update('status', status === 'done' ? null : 'done')}
            className={`ml-auto text-xs rounded-lg px-3 py-1.5 border transition-colors ${status === 'done' ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            Ver completadas
          </button>
        )}
      </div>

      {/* Filters — hidden in calendar view */}
      {currentView !== 'calendar' && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Urgencia:</span>
          {(Object.entries(URGENCY_CONFIG) as [string, typeof URGENCY_CONFIG[keyof typeof URGENCY_CONFIG]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => update('urgency', urgency === key ? null : key)}
              className={`rounded-md border px-2 py-0.5 text-xs font-semibold transition-all ${urgency === key ? cfg.color : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {cfg.label}
            </button>
          ))}

          {categories.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground self-center ml-2">Categoría:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => update('category', category === cat.id ? null : cat.id)}
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
