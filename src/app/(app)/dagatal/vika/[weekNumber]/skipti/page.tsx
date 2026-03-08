'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DayPicker } from '@/components/forms/day-picker'
import { createSwap } from '@/actions/swap'
import { useBanner } from '@/hooks/use-banner'
import { createClient } from '@/lib/supabase/client'
import { addDays } from 'date-fns'
import type { WeekAllocation, Household } from '@/types/db'

export default function SkiptiPage() {
  const { weekNumber } = useParams<{ weekNumber: string }>()
  const router = useRouter()
  const { showBanner } = useBanner()
  const [myAllocation, setMyAllocation] = useState<WeekAllocation | null>(null)
  const [otherAllocations, setOtherAllocations] = useState<
    (WeekAllocation & { household: Household })[]
  >([])
  const [myDays, setMyDays] = useState<string[]>([])
  const [targetAllocId, setTargetAllocId] = useState('')
  const [targetDays, setTargetDays] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profile')
        .select('household_id')
        .eq('id', user.id)
        .single()
      if (!profile) return

      const year = new Date().getFullYear()
      const { data: yr } = await supabase.from('year').select('id').eq('year', year).single()
      if (!yr) return

      const { data: myAlloc } = await supabase
        .from('week_allocation')
        .select('*')
        .eq('year_id', yr.id)
        .eq('week_number', Number.parseInt(weekNumber))
        .single()
      setMyAllocation(myAlloc)

      const { data: others } = await supabase
        .from('week_allocation')
        .select('*, household:household_id(*)')
        .eq('year_id', yr.id)
        .eq('type', 'household')
        .neq('household_id', profile.household_id)
        .order('week_number')
      setOtherAllocations(
        (others ?? []) as (WeekAllocation & { household: Household })[],
      )
    }
    load()
  }, [weekNumber])

  if (!myAllocation) return <div className="p-4">Hleður...</div>

  const myDaysList: string[] = []
  const start = new Date(myAllocation.week_start)
  for (let i = 0; i < 7; i++) {
    myDaysList.push(addDays(start, i).toISOString().split('T')[0])
  }

  const targetAlloc = otherAllocations.find((a) => a.id === targetAllocId)
  const targetDaysList: string[] = []
  if (targetAlloc) {
    const tStart = new Date(targetAlloc.week_start)
    for (let i = 0; i < 7; i++) {
      targetDaysList.push(addDays(tStart, i).toISOString().split('T')[0])
    }
  }

  async function handleSubmit() {
    if (!myAllocation || !targetAllocId || myDays.length === 0 || targetDays.length === 0)
      return
    setLoading(true)
    const result = await createSwap(myAllocation.id, myDays, targetAllocId, targetDays)
    if (result.error) {
      showBanner(result.error, 'error')
    } else {
      showBanner('Tillaga send')
      router.push(`/dagatal/vika/${weekNumber}`)
    }
    setLoading(false)
  }

  return (
    <div className="px-4 py-4 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-blue-600">
          ←
        </button>
        <h1 className="font-semibold">Leggja til skipti</h1>
      </div>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium">
          Þín vika (V.{weekNumber}) — veldu daga til að bjóða:
        </p>
        <DayPicker days={myDaysList} value={myDays} onChange={setMyDays} />
      </section>

      <section className="mb-6">
        <p className="mb-2 text-sm font-medium">Skipti við:</p>
        <select
          value={targetAllocId}
          onChange={(e) => {
            setTargetAllocId(e.target.value)
            setTargetDays([])
          }}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Veldu viku...</option>
          {otherAllocations.map((a) => (
            <option key={a.id} value={a.id}>
              V.{a.week_number} — {a.household?.name ?? '—'} ({a.week_start})
            </option>
          ))}
        </select>
      </section>

      {targetAllocId && (
        <section className="mb-6">
          <p className="mb-2 text-sm font-medium">Veldu daga sem þú vilt:</p>
          <DayPicker days={targetDaysList} value={targetDays} onChange={setTargetDays} />
        </section>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          loading || myDays.length === 0 || !targetAllocId || targetDays.length === 0
        }
        className="w-full rounded bg-blue-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Sendir...' : 'Senda tillögu'}
      </button>
    </div>
  )
}
