'use client'

import { retractRelease } from '@/actions/release'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function RetractDayButton({ dayReleaseId }: { dayReleaseId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const res = await retractRelease([dayReleaseId])
      if ('success' in res) router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline disabled:opacity-50"
    >
      {pending ? '…' : 'Afturkalla'}
    </button>
  )
}
