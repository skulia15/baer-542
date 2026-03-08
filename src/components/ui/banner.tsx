'use client'

import { BannerContext } from '@/hooks/use-banner'
import { CheckCircle, XCircle } from 'lucide-react'
import { useContext } from 'react'

export function Banner() {
  const { banner } = useContext(BannerContext)

  if (!banner.visible) return null

  const isSuccess = banner.variant === 'success'

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium shadow-md ${
        isSuccess ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 flex-shrink-0" />
      )}
      {banner.message}
    </div>
  )
}
