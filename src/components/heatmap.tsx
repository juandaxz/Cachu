'use client'

import { buildYearGrid } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

interface HeatmapProps {
  valueMap: Record<string, number>
  maxValue?: number
  color?: string
  label?: string
}

function getIntensity(value: number, max: number): number {
  if (value === 0) return 0
  return Math.ceil((value / max) * 4)
}

const COLORS = {
  default: [
    'bg-secondary',
    'bg-emerald-900/60',
    'bg-emerald-700/70',
    'bg-emerald-600',
    'bg-emerald-400',
  ],
}

export function Heatmap({ valueMap, maxValue, color = 'emerald', label }: HeatmapProps) {
  const weeks = buildYearGrid(valueMap)
  const max = maxValue ?? Math.max(1, ...Object.values(valueMap))

  // Build month labels
  const monthLabels: { label: string; offset: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => !d.isFuture)
    if (!firstDay) return
    const month = parseISO(firstDay.date).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], offset: wi })
      lastMonth = month
    }
  })

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1 ml-4">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground"
                style={{ marginLeft: i === 0 ? `${m.offset * 14}px` : `${(m.offset - (monthLabels[i-1]?.offset ?? 0)) * 14 - 20}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[2px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day) => {
                  const intensity = day.isFuture ? 0 : getIntensity(day.value, max)
                  const bgColor = COLORS.default[intensity]
                  return (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.value}`}
                      className={`w-[12px] h-[12px] rounded-[2px] ${bgColor} ${day.isToday ? 'ring-1 ring-primary' : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-xs text-muted-foreground">Menos</span>
            {COLORS.default.map((c, i) => (
              <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
            ))}
            <span className="text-xs text-muted-foreground">Más</span>
          </div>
        </div>
      </div>
    </div>
  )
}
