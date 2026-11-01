'use client'
import { useRowLabel } from '@payloadcms/ui'

import { formatRange } from '@/lib/hours'

const names: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

export function DayRowLabel() {
  const { data } = useRowLabel<{ day?: string; closed?: boolean; open?: string; close?: string }>()
  const day = names[data?.day ?? ''] ?? 'Day'
  const detail = data?.closed ? 'Closed' : data?.open && data?.close ? formatRange(data.open, data.close) : ''
  return (
    <span>
      {day}
      {detail ? <span style={{ opacity: 0.6 }}> · {detail}</span> : null}
    </span>
  )
}
