'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateInviteLink } from '@/actions/invite'
import { createClient } from '@/lib/supabase/client'

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
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="text-blue-600">
          ←
        </button>
        <h1 className="font-semibold">Bjóða meðlim</h1>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Búðu til boðshlekkur sem gildir í 7 daga. Sendið hlekk í tölvupósti eða síma.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !householdId}
        className="w-full rounded bg-blue-600 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Bý til...' : 'Búa til boðshlekkur'}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {inviteUrl && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-gray-500">Boðshlekkur (gildir í 7 daga):</p>
          <div className="rounded border border-gray-200 bg-gray-50 p-3">
            <p className="break-all text-xs text-gray-800">{inviteUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Afrita hlekkur
          </button>
        </div>
      )}
    </div>
  )
}
