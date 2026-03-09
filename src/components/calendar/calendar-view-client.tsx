'use client'

import { useRouter } from 'next/navigation'
import { CalendarView } from './calendar-view'
import type { WeekAllocation, DayRelease, Household } from '@/types/db'

interface ApprovedSwap {
  allocation_a_id: string
  allocation_b_id: string
  household_a_id: string
  household_b_id: string
}

interface Props {
  allocations: WeekAllocation[]
  releases: DayRelease[]
  households: Household[]
  currentHouseholdId: string
  year: number
  approvedSwaps: ApprovedSwap[]
}

export function CalendarViewClient(props: Props) {
  const router = useRouter()

  return (
    <CalendarView
      {...props}
      onYearChange={(y) => router.push(`/dagatal?ar=${y}`)}
    />
  )
}
