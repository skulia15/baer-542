'use client'

import type { DayRelease, Household, WeekAllocation } from '@/types/db'
import { getHolidays } from 'fridagar'
import type { Holiday } from 'fridagar'
import { useMemo } from 'react'
import { MonthGrid } from './month-grid'

interface Props {
  allocations: WeekAllocation[]
  releases: DayRelease[]
  households: Household[]
  currentHouseholdId: string
  year: number
}

export function CalendarGridView({
  allocations,
  releases,
  households,
  currentHouseholdId,
  year,
}: Props) {
  const todayStr = new Date().toISOString().split('T')[0]
  const householdMap = useMemo(() => new Map(households.map((h) => [h.id, h])), [households])

  const holidayMap = useMemo(() => {
    const holidays = getHolidays(year) as Holiday[]
    const map = new Map<string, Holiday>()
    for (const h of holidays) {
      // fridagar dates are UTC midnight — extract YYYY-MM-DD
      map.set(h.date.toISOString().split('T')[0], h)
    }
    return map
  }, [year])

  return (
    <div className="px-3 pb-20 pt-2">
      {Array.from({ length: 12 }, (_, i) => i + 1).filter((month) => {
        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1
        return year > currentYear || (year === currentYear && month >= currentMonth)
      }).map((month) => (
        <MonthGrid
          key={month}
          year={year}
          month={month}
          allocations={allocations}
          releases={releases}
          householdMap={householdMap}
          currentHouseholdId={currentHouseholdId}
          holidayMap={holidayMap}
          todayStr={todayStr}
        />
      ))}
    </div>
  )
}
