'use client'

import { generateInviteLink } from '@/actions/invite'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BodaPage() {
  const router = useRouter()
  const [householdId, setHouseholdId] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      if (profile) setHouseholdId(profile.household_id)
    }
    load()
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setError('')
    const result = await generateInviteLink(householdId)
    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setInviteUrl(result.url)
    }
    setLoading(false)
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-1 text-stone-500 transition-colors hover:bg-stone-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-semibold text-stone-900">Bjóða meðlim</h1>
      </div>
      <p className="mb-4 text-sm text-stone-500">
        Búðu til boðshlekkur sem gildir í 7 daga. Sendið hlekk í tölvupósti eða síma.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !householdId}
        className="w-full rounded-xl bg-green-700 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {loading ? 'Bý til...' : 'Búa til boðshlekkur'}
      </button>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {inviteUrl && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-stone-500">
            Boðshlekkur (gildir í 7 daga):
          </p>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="break-all text-xs text-stone-700">{inviteUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="mt-2 text-sm font-medium text-green-700 underline underline-offset-2"
          >
            Afrita hlekkur
          </button>
        </div>
      )}
    </div>
  )
}
