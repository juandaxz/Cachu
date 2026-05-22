'use client'

import { buildYearGrid, buildHistoryGrid } from '@/lib/utils'
import { parseISO } from 'date-fns'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface HeatmapProps {
  valueMap: Record<string, number>
  maxValue?: number
  label?: string
  compact?: boolean
  history?: boolean
  color?: string
}

function getIntensity(value: number, max: number): number {
  if (value === 0) return 0
  return Math.ceil((value / max) * 4)
}

const INTENSITY_COLORS = [
  'bg-secondary',
  'bg-emerald-900/60',
  'bg-emerald-700/70',
  'bg-emerald-600',
  'bg-emerald-400',
]

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '100,100,100'
  return `${r},${g},${b}`
}

function getDotStyle(intensity: number, color?: string): React.CSSProperties {
  if (!color) return {}
  if (intensity === 0) return { backgroundColor: 'rgba(255,255,255,0.07)' }
  const opacities = [0, 0.25, 0.5, 0.75, 1.0]
  return { backgroundColor: `rgba(${hexToRgb(color)},${opacities[intensity]})` }
}

export function Heatmap({ valueMap, maxValue, label, compact = false, history = false, color }: HeatmapProps) {
  const weekCount = compact ? 17 : 52
  const weeks = history ? buildHistoryGrid(valueMap, weekCount) : buildYearGrid(valueMap, compact ? 20 : 52)
  const max = maxValue ?? Math.max(1, ...Object.values(valueMap))

  const showLabels = !(compact && history)

  const monthAtWeek: Record<number, string> = {}
  if (showLabels) {
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const month = parseISO(week[0].date).getMonth()
      if (month !== lastMonth) {
        monthAtWeek[wi] = MONTHS[month]
        lastMonth = month
      }
    })
  }

  return (
    <div className="w-full space-y-1">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}

      {showLabels && (
        <div className="flex w-full gap-[2px]">
          {weeks.map((_, wi) => (
            <div key={wi} className="flex-1 min-w-0 overflow-hidden h-3">
              {monthAtWeek[wi] && (
                <span className="text-[10px] text-muted-foreground leading-none">{monthAtWeek[wi]}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex w-full gap-[2px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex-1 flex flex-col gap-[2px]">
            {week.map((day) => {
              const intensity = day.isFuture ? 0 : getIntensity(day.value, max)
              const dotStyle = getDotStyle(intensity, color)
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.value}`}
                  className={`w-full aspect-square rounded-[3px] ${!color ? INTENSITY_COLORS[intensity] : ''} ${day.isToday && !history ? 'ring-1 ring-primary ring-inset' : ''}`}
                  style={dotStyle}
                />
              )
            })}
          </div>
        ))}
      </div>

      {showLabels && (
        <div className="flex items-center gap-1 justify-end pt-0.5">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <div key={i} className={`h-[10px] w-[10px] rounded-[2px] ${c}`} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      )}
    </div>
  )
}
