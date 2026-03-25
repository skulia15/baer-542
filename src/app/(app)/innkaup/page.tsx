import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ShoppingCart } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ShoppingListClient } from './shopping-list-client'

export default async function InnkaupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profile')
    .select('household_id, household:household_id(house_id)')
    .eq('id', user.id)
    .single()
  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const household = profile.household as unknown as { house_id: string } | null
  if (!household) redirect('/login')

  const [{ data: items }, { data: log }, { data: profiles }] = await Promise.all([
    supabase
      .from('shopping_item')
      .select('*')
      .eq('house_id', household.house_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('shopping_item_log')
      .select('*')
      .eq('house_id', household.house_id)
      .order('created_at', { ascending: false })
      .limit(30),
    createServiceClient()
      .from('profile')
      .select('id, name, household:household_id(house_id)')
  ])

  // Build a lookup from user id to profile name
  const nameMap: Record<string, string> = {}
  for (const p of profiles ?? []) {
    const h = p.household as unknown as { house_id: string } | null
    if (h?.house_id === household.house_id) {
      nameMap[p.id] = p.name
    }
  }

  const typedItems = (items ?? []).map((item) => ({
    id: item.id as string,
    name: item.name as string,
    bought_at: item.bought_at as string | null,
    reported_by_name: nameMap[item.created_by as string] ?? null,
    bought_by_name: item.bought_by ? (nameMap[item.bought_by as string] ?? null) : null,
  }))

  const typedLog = (log ?? []).map((entry) => ({
    id: entry.id as string,
    action: entry.action as 'added' | 'bought' | 'deleted',
    item_name: entry.item_name as string,
    created_at: entry.created_at as string,
    user_name: nameMap[entry.created_by as string] ?? null,
  }))

  const pendingCount = typedItems.filter((i) => !i.bought_at).length

  return (
    <div>
      <div className="border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-stone-500" />
          <h1 className="font-semibold text-stone-900">Innkaupslisti</h1>
          {pendingCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-700 px-1.5 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>
      </div>
      <ShoppingListClient items={typedItems} log={typedLog} />
    </div>
  )
}
