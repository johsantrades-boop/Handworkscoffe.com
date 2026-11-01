'use client'
import { useEffect, useState } from 'react'

import {
  DAY_NAMES,
  DAY_ORDER,
  formatRange,
  isoDay,
  nowInVancouver,
  todayStatus,
  upcomingSpecialHours,
  type DayKey,
  type SpecialHours,
  type WeeklyHours,
} from '@/lib/hours'

type Props = { hours: WeeklyHours; specialHours: SpecialHours }

export function HoursCard({ hours, specialHours }: Props) {
  // Today is worked out in the browser so cached pages stay correct.
  const [status, setStatus] = useState<ReturnType<typeof todayStatus> | null>(null)
  const [todayIso, setTodayIso] = useState<string | null>(null)

  useEffect(() => {
    const update = () => {
      setStatus(todayStatus(hours, specialHours))
      setTodayIso(nowInVancouver().isoDate)
    }
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [hours, specialHours])

  const byDay = new Map(hours.map((h) => [h.day as DayKey, h]))
  const special = todayIso ? upcomingSpecialHours(specialHours, todayIso) : []

  return (
    <div className="hours">
      <p className={`hours__status${status?.isOpen ? ' is-open' : ''}`} aria-live="polite">
        <span className="hours__dot" aria-hidden="true" />
        {status ? status.label : 'Checking today’s hours…'}
      </p>
      <table className="hours__table">
        <caption className="sr-only">Weekly opening hours</caption>
        <tbody>
          {DAY_ORDER.map((d) => {
            const h = byDay.get(d)
            const isToday = status?.day === d
            return (
              <tr key={d} className={isToday ? 'is-today' : undefined} aria-current={isToday ? 'date' : undefined}>
                <th scope="row">
                  {DAY_NAMES[d]}
                  {isToday ? <span className="hours__today">Today</span> : null}
                </th>
                <td>{!h || h.closed ? 'Closed' : formatRange(h.open, h.close)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {special.length > 0 ? (
        <div className="hours__special">
          <p className="label">Special hours</p>
          <ul>
            {special.map((s) => (
              <li key={s.id ?? s.date} className={todayIso && isoDay(s.date) === todayIso ? 'is-today' : undefined}>
                <span>
                  {new Date(s.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  {s.label ? ` · ${s.label}` : ''}
                </span>
                <span>{s.closed ? 'Closed' : formatRange(s.open, s.close)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
