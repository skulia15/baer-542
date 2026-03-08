import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { markAllRead } from '@/actions/notifications'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/dates'
import type { Notification } from '@/types/db'

function getNotifHref(n: Notification): string {
  if (n.reference_type === 'request' && n.reference_id)
    return `/tilkynningar/bidni/${n.reference_id}`
  if (n.reference_type === 'swap_proposal' && n.reference_id)
    return `/tilkynningar/skipti/${n.reference_id}`
  return '/tilkynningar'
}

export default async function TilkynningarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notification')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  await markAllRead()

  return (
    <div>
      <div className="border-b border-gray-100 px-4 py-3">
        <h1 className="font-bold">Tilkynningar</h1>
      </div>
      <div className="divide-y divide-gray-100">
        {(notifications ?? []).length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Engar tilkynningar</p>
        )}
        {(notifications ?? []).map((n) => (
          <Link key={n.id} href={getNotifHref(n)}>
            <div className={`flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-blue-50'}`}>
              {!n.read && (
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
              )}
              <div className={n.read ? 'pl-5' : ''}>
                <p
                  className={`text-sm ${n.read ? 'text-gray-700' : 'font-medium text-gray-900'}`}
                >
                  {n.message}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
