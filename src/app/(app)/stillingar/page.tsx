import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StillingarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profile')
    .select('*, household:household_id(*)')
    .eq('id', user.id)
    .single()
  if (!profile) redirect('/login')

  const household = profile.household as { name: string; color: string } | null
  const isHead = profile.role === 'head'

  return (
    <div>
      <div className="border-b border-gray-100 px-4 py-3">
        <h1 className="font-bold">Stillingar</h1>
      </div>
      <div className="divide-y divide-gray-100">
        {isHead && (
          <>
            <Link
              href="/stillingar/uppsetning"
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm">Uppsetning árs</span>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/stillingar/boda"
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm">Bjóða meðlim</span>
              <span className="text-gray-400">→</span>
            </Link>
          </>
        )}
        <Link
          href="/stillingar/adgangur"
          className="flex items-center justify-between px-4 py-3"
        >
          <span className="text-sm">Aðgangur</span>
          <span className="text-gray-400">→</span>
        </Link>
      </div>
      <div className="px-4 py-4">
        <p className="text-xs text-gray-500">
          {profile.name} · {household?.name} ·{' '}
          <span className="font-medium">{isHead ? 'Yfirmaður' : 'Meðlimur'}</span>
        </p>
      </div>
    </div>
  )
}
