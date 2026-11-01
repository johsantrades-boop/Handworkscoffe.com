import type { BusinessInfo } from '@/payload-types'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type WeeklyHours = NonNullable<BusinessInfo['hours']>
export type SpecialHours = NonNullable<BusinessInfo['specialHours']>

export const TIMEZONE = 'America/Vancouver'
export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const DAY_NAMES: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

/** "15:00" → "3 p.m.", "09:30" → "9:30 a.m." */
export function formatTime(t?: string | null) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'a.m.' : 'p.m.'}`
}

export function formatRange(open?: string | null, close?: string | null) {
  return open && close ? `${formatTime(open)} – ${formatTime(close)}` : 'Hours to be confirmed'
}

/** Current date/time parts in Vancouver, regardless of the visitor's timezone. */
export function nowInVancouver(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )
  const day = parts.weekday.toLowerCase().slice(0, 3) as DayKey
  return {
    day,
    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

const toMinutes = (t?: string | null) => {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Special-hours entries are stored as dates; compare by calendar day in Vancouver. */
export const isoDay = (value: string) => new Date(value).toISOString().slice(0, 10)

export function upcomingSpecialHours(special: SpecialHours | null | undefined, fromIso: string, days = 21) {
  const limit = new Date(`${fromIso}T00:00:00Z`)
  limit.setUTCDate(limit.getUTCDate() + days)
  const limitIso = limit.toISOString().slice(0, 10)
  return (special ?? [])
    .filter((s) => s.date && isoDay(s.date) >= fromIso && isoDay(s.date) <= limitIso)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Works out today's hours (with any holiday override) and whether the shop is open right now. */
export function todayStatus(hours: WeeklyHours | null | undefined, special: SpecialHours | null | undefined, date = new Date()) {
  const now = nowInVancouver(date)
  const override = (special ?? []).find((s) => s.date && isoDay(s.date) === now.isoDate)
  const regular = (hours ?? []).find((h) => h.day === now.day)
  const today = override ?? regular
  const closed = !today || today.closed || !today.open || !today.close
  const open = toMinutes(today?.open)
  const close = toMinutes(today?.close)
  const isOpen = !closed && open !== null && close !== null && now.minutes >= open && now.minutes < close
  const opensLater = !closed && open !== null && now.minutes < open

  let label = 'Closed today'
  if (isOpen) label = `Open now · until ${formatTime(today?.close)}`
  else if (opensLater) label = `Opens today at ${formatTime(today?.open)}`
  else if (!closed) label = 'Closed for the day'

  return { day: now.day, isOpen, label, override: override ?? null }
}
