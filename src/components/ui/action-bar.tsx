import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ActionBarProps {
  pendingCount: number
}

export function ActionBar({ pendingCount }: ActionBarProps) {
  if (pendingCount === 0) return null

  return (
    <Link href="/tilkynningar">
      <div className="flex items-center gap-2 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        {pendingCount} {pendingCount === 1 ? 'beiðni/skipti bíður' : 'beiðnir/skipti bíða'}{' '}
        samþykkis
      </div>
    </Link>
  )
}
