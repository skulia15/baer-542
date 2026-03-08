import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/actions/auth'
import Link from 'next/link'

export default async function AdgangurPage() {
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

  const household = profile.household as { name: string } | null

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/stillingar" className="text-blue-600">
          ←
        </Link>
        <h1 className="font-semibold">Aðgangur</h1>
      </div>
      <div className="mb-6 space-y-2 rounded border border-gray-200 p-4">
        <p className="text-sm">
          <span className="text-gray-500">Nafn:</span> {profile.name}
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Netfang:</span> {profile.email}
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Fjölskylda:</span> {household?.name ?? '—'}
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Hlutverk:</span>{' '}
          {profile.role === 'head' ? 'Yfirmaður' : 'Meðlimur'}
        </p>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded border border-red-300 py-3 text-sm font-medium text-red-600"
        >
          Skrá út
        </button>
      </form>
    </div>
  )
}
