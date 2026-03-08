'use client'

import { createSwap } from '@/actions/swap'
import { DayPicker } from '@/components/forms/day-picker'
import { useBanner } from '@/hooks/use-banner'
import { createClient } from '@/lib/supabase/client'
import type { Household, WeekAllocation } from '@/types/db'
import { addDays } from 'date-fns'
import { ChevronLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type AllocWithHousehold = WeekAllocation & { household: Household }

export default function SkiptiPage() {
  const { weekNumber } = useParams<{ weekNumber: string }>()
  const router = useRouter()
  const { showBanner } = useBanner()

  // The week we navigated from (could be own or other's)
  const [currentAlloc, setCurrentAlloc] = useState<AllocWithHousehold | null>(null)
  const [isOwn, setIsOwn] = useState<boolean | null>(null)

  // When isOwn: pick target from otherAllocations
  // When !isOwn: pick "my week" from myAllocations; current week is the target
  const [otherAllocations, setOtherAllocations] = useState<AllocWithHousehold[]>([])
  const [myAllocations, setMyAllocations] = useState<AllocWithHousehold[]>([])

  // A = proposer's side, B = other side
  const [allocAId, setAllocAId] = useState('')
  const [allocBId, setAllocBId] = useState('')
  const [daysA, setDaysA] = useState<string[]>([])
  const [daysB, setDaysB] = useState<string[]>([])
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

      const { data: current } = await supabase
        .from('week_allocation')
        .select('*, household:household_id(*)')
        .eq('year_id', yr.id)
        .eq('week_number', Number.parseInt(weekNumber))
        .single()
      if (!current) return
      setCurrentAlloc(current as AllocWithHousehold)

      const own = current.household_id === profile.household_id
      setIsOwn(own)

      if (own) {
        // A = current week (mine), pick B from others
        setAllocAId(current.id)
        const { data: others } = await supabase
          .from('week_allocation')
          .select('*, household:household_id(*)')
          .eq('year_id', yr.id)
          .eq('type', 'household')
          .neq('household_id', profile.household_id)
          .order('week_number')
        setOtherAllocations((others ?? []) as AllocWithHousehold[])
      } else {
        // B = current week (other's), pick A from my own weeks
        setAllocBId(current.id)
        const { data: mine } = await supabase
          .from('week_allocation')
          .select('*, household:household_id(*)')
          .eq('year_id', yr.id)
          .eq('type', 'household')
          .eq('household_id', profile.household_id)
          .order('week_number')
        setMyAllocations((mine ?? []) as AllocWithHousehold[])
      }
    }
    load()
  }, [weekNumber])

  if (!currentAlloc || isOwn === null)
    return <div className="p-4 text-sm text-stone-500">Hleður...</div>

  function getDays(alloc: AllocWithHousehold | undefined): string[] {
    if (!alloc) return []
    const list: string[] = []
    const s = new Date(alloc.week_start)
    for (let i = 0; i < 7; i++) list.push(addDays(s, i).toISOString().split('T')[0])
    return list
  }

  const allocA = isOwn ? currentAlloc : myAllocations.find((a) => a.id === allocAId)
  const allocB = isOwn ? otherAllocations.find((a) => a.id === allocBId) : currentAlloc

  async function handleSubmit() {
    if (!allocA || !allocB || daysA.length === 0 || daysB.length === 0) return
    setLoading(true)
    const result = await createSwap(allocA.id, daysA, allocB.id, daysB)
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
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-1 text-stone-500 transition-colors hover:bg-stone-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-stone-900">Leggja til skipti</h1>
      </div>

      {/* My side (A) */}
      <section className="mb-6">
        {isOwn ? (
          <>
            <p className="mb-2 text-sm font-medium text-stone-700">
              Þín vika (V.{weekNumber}) — veldu daga til að bjóða:
            </p>
            <DayPicker days={getDays(currentAlloc)} value={daysA} onChange={setDaysA} />
          </>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium text-stone-700">
              Þín vika — veldu viku til að bjóða:
            </p>
            <select
              value={allocAId}
              onChange={(e) => {
                setAllocAId(e.target.value)
                setDaysA([])
              }}
              className="mb-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="">Veldu þína viku...</option>
              {myAllocations.map((a) => (
                <option key={a.id} value={a.id}>
                  V.{a.week_number} ({a.week_start})
                </option>
              ))}
            </select>
            {allocAId && <DayPicker days={getDays(allocA)} value={daysA} onChange={setDaysA} />}
          </>
        )}
      </section>

      {/* Other side (B) */}
      <section className="mb-6">
        {isOwn ? (
          <>
            <p className="mb-2 text-sm font-medium text-stone-700">Skipti við:</p>
            <select
              value={allocBId}
              onChange={(e) => {
                setAllocBId(e.target.value)
                setDaysB([])
              }}
              className="mb-3 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value="">Veldu viku...</option>
              {otherAllocations.map((a) => (
                <option key={a.id} value={a.id}>
                  V.{a.week_number} — {a.household?.name ?? '—'} ({a.week_start})
                </option>
              ))}
            </select>
            {allocBId && <DayPicker days={getDays(allocB)} value={daysB} onChange={setDaysB} />}
          </>
        ) : (
          <>
            <p className="mb-2 text-sm font-medium text-stone-700">
              Skipti við V.{weekNumber} ({currentAlloc.household?.name ?? '—'}) — veldu daga:
            </p>
            <DayPicker days={getDays(currentAlloc)} value={daysB} onChange={setDaysB} />
          </>
        )}
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          loading ||
          daysA.length === 0 ||
          daysB.length === 0 ||
          (!isOwn && !allocAId) ||
          (isOwn && !allocBId)
        }
        className="w-full rounded-xl bg-green-700 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {loading ? 'Sendir...' : 'Senda tillögu'}
      </button>
    </div>
  )
}
