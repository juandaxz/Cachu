import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, subDays, addDays, eachDayOfInterval, startOfWeek, parseISO, differenceInDays } from 'date-fns'
import type { HabitCheckin, AntiHabitCheckin } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// Build a map of date -> value for the last 365 days
export function buildCheckinMap(checkins: HabitCheckin[]): Record<string, number> {
  return checkins.reduce((acc, c) => {
    acc[c.date] = c.value
    return acc
  }, {} as Record<string, number>)
}

// Build a set of checked-in dates for anti-habits
export function buildAntiCheckinSet(checkins: AntiHabitCheckin[]): Set<string> {
  return new Set(checkins.map((c) => c.date))
}

// Calculate current streak for a positive habit (consecutive days ending today or yesterday)
export function calcHabitStreak(checkins: HabitCheckin[]): number {
  if (checkins.length === 0) return 0
  const checkedDates = new Set(checkins.map((c) => c.date))
  let streak = 0
  const todayStr = today()
  let cursor = checkedDates.has(todayStr) ? new Date() : subDays(new Date(), 1)
  while (checkedDates.has(formatDate(cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

// Calculate current streak for an anti-habit (consecutive daily check-ins)
export function calcAntiHabitStreak(checkins: AntiHabitCheckin[], startDate: string): number {
  const checkedDates = buildAntiCheckinSet(checkins)
  const todayStr = today()
  // If not checked in today, streak ends yesterday
  let cursor = checkedDates.has(todayStr) ? new Date() : subDays(new Date(), 1)
  let streak = 0
  // Don't go before start_date
  const start = parseISO(startDate)
  while (
    checkedDates.has(formatDate(cursor)) &&
    differenceInDays(cursor, start) >= 0
  ) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

// Calculate total clean days from start_date to today
export function calcTotalCleanDays(startDate: string): number {
  return differenceInDays(new Date(), parseISO(startDate)) + 1
}

// Format duration as "X días, Y horas"
export function formatDuration(startDate: string): string {
  const diff = differenceInDays(new Date(), parseISO(startDate))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return '1 día'
  return `${diff} días`
}

// Build the year grid for heatmap (52 weeks × 7 days)
export interface HeatmapDay {
  date: string
  value: number
  isToday: boolean
  isFuture: boolean
}

export function buildYearGrid(valueMap: Record<string, number>, weekCount = 52): HeatmapDay[][] {
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const gridStart = startOfWeek(now, { weekStartsOn: 0 })
  const gridEnd = addDays(gridStart, 7 * weekCount - 1)

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: HeatmapDay[][] = []
  let week: HeatmapDay[] = []

  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const isFuture = dateStr > todayStr
    week.push({
      date: dateStr,
      value: isFuture ? 0 : (valueMap[dateStr] ?? 0),
      isToday: dateStr === todayStr,
      isFuture,
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  })
  if (week.length > 0) weeks.push(week)
  return weeks
}

// Build history grid (past weekCount weeks ending at the current week)
export function buildHistoryGrid(valueMap: Record<string, number>, weekCount = 17): HeatmapDay[][] {
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 })
  const gridStart = subDays(currentWeekStart, 7 * (weekCount - 1))
  const gridEnd = addDays(currentWeekStart, 6)

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weeks: HeatmapDay[][] = []
  let week: HeatmapDay[] = []

  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const isFuture = dateStr > todayStr
    week.push({
      date: dateStr,
      value: isFuture ? 0 : (valueMap[dateStr] ?? 0),
      isToday: dateStr === todayStr,
      isFuture,
    })
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length > 0) weeks.push(week)
  return weeks
}

// Get urgency label and color
export const URGENCY_CONFIG = {
  low: { label: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  risk: { label: 'RISK', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

export const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'text-blue-400' },
  done: { label: 'Hecho', color: 'text-green-400' },
} as const

export const MOTIVATIONAL_MESSAGES = [
  'You can do this. Don\'t give in now.',
  'You are stronger than this urge.',
  'This moment will pass. Breathe deeply.',
  'Remember why you started.',
  'Go for a walk, drink water, count to 10.',
  'Regret lasts longer than the pleasure.',
  'Every day you resist gets easier.',
  'Call someone you trust.',
  'Don\'t let down who you could become.',
]

export const DEFAULT_CATEGORIES = [
  { name: 'University', color: '#6366f1' },
  { name: 'Personal', color: '#ec4899' },
  { name: 'Work', color: '#f59e0b' },
  { name: 'Health', color: '#10b981' },
]
