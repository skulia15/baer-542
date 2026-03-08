'use client'

import { approveRequest, declineRequest } from '@/actions/request'
import { approveSwap, declineSwap } from '@/actions/swap'
import { useBanner } from '@/hooks/use-banner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ApproveDeclineFormProps {
  type: 'request' | 'swap'
  id: string
}

export function ApproveDeclineForm({ type, id }: ApproveDeclineFormProps) {
  const router = useRouter()
  const { showBanner } = useBanner()
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const result = type === 'request' ? await approveRequest(id) : await approveSwap(id)
    if (result.error) {
      showBanner(result.error, 'error')
    } else {
      showBanner(type === 'request' ? 'Beiðni samþykkt' : 'Skipti samþykkt')
      router.push('/tilkynningar')
    }
    setLoading(false)
  }

  async function handleDecline() {
    setLoading(true)
    const result =
      type === 'request' ? await declineRequest(id, reason) : await declineSwap(id, reason)
    if (result.error) {
      showBanner(result.error, 'error')
    } else {
      showBanner(type === 'request' ? 'Beiðni hafnað' : 'Skiptatillögu hafnað')
      router.push('/tilkynningar')
    }
    setLoading(false)
  }

  return (
    <div>
      {!declining ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 rounded-xl bg-green-700 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            Samþykkja
          </button>
          <button
            type="button"
            onClick={() => setDeclining(true)}
            disabled={loading}
            className="flex-1 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            Hafna
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ástæða (valfrjálst)..."
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeclining(false)}
              className="flex-1 rounded-xl border border-stone-200 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-50"
            >
              Hætta við
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Staðfesta höfnun
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
