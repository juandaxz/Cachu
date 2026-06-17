export interface CalendarEvent {
  uid: string
  title: string
  description: string
  start: Date
  end: Date | null
  url: string
  courseName: string
}

function unfold(raw: string): string {
  return raw.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function decodeValue(val: string): string {
  return val
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim()
}

function parseDate(val: string): Date | null {
  // TZID=... or VALUE=DATE or plain YYYYMMDDTHHMMSSZ
  const clean = val.replace(/^[^:]+:/, '') // strip params before colon
  if (/^\d{8}T\d{6}Z$/.test(clean)) {
    return new Date(
      `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}Z`
    )
  }
  if (/^\d{8}T\d{6}$/.test(clean)) {
    // local time — treat as UTC
    return new Date(
      `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}Z`
    )
  }
  if (/^\d{8}$/.test(clean)) {
    return new Date(`${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`)
  }
  return null
}

function extractCourse(description: string): string {
  const match = description.match(/\n([^\n]+)\n/)
  return match ? match[1].trim() : ''
}

export async function fetchCalendarEvents(icalUrl: string): Promise<CalendarEvent[]> {
  const res = await fetch(icalUrl, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error('No se pudo obtener el calendario')
  const raw = await res.text()
  const text = unfold(raw)

  const events: CalendarEvent[] = []
  const lines = text.split('\n')

  let inEvent = false
  let current: Record<string, string> = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      inEvent = false
      const title = decodeValue(current['SUMMARY'] ?? '')
      const description = decodeValue(current['DESCRIPTION'] ?? '')
      const uid = current['UID'] ?? Math.random().toString()
      const url = current['URL'] ?? ''

      const dtstart = current['DTSTART'] ?? current[Object.keys(current).find(k => k.startsWith('DTSTART')) ?? ''] ?? ''
      const dtend = current['DTEND'] ?? current[Object.keys(current).find(k => k.startsWith('DTEND')) ?? ''] ?? ''

      const start = parseDate(dtstart)
      const end = parseDate(dtend)

      if (title && start) {
        events.push({
          uid,
          title,
          description,
          start,
          end,
          url,
          courseName: extractCourse(description),
        })
      }
      continue
    }
    if (!inEvent) continue

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).toUpperCase()
    const value = line.slice(colonIdx + 1)
    current[key] = value
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function formatEventTime(date: Date): string | null {
  const h = date.getUTCHours()
  const m = date.getUTCMinutes()
  if (h === 0 && m === 0) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function upcomingEvents(events: CalendarEvent[], days = 14): CalendarEvent[] {
  const now = new Date()
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return events.filter((e) => e.start >= now && e.start <= cutoff)
}
