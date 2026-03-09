'use server'

import { createClient } from '@/lib/supabase/server'

export async function addShoppingItem(
  name: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Ekki innskráður' }

  const { data: profile } = await supabase
    .from('profile')
    .select('household_id, household:household_id(house_id)')
    .eq('id', user.id)
    .single()
  if (!profile) return { error: 'Prófíll ekki fundinn' }

  const household = profile.household as unknown as { house_id: string } | null
  if (!household) return { error: 'Heimili ekki fundið' }

  const { error } = await supabase.from('shopping_item').insert({
    house_id: household.house_id,
    name: name.trim(),
    reported_by_household_id: profile.household_id as string,
    created_by: user.id,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function markAsBought(id: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Ekki innskráður' }

  const { data: profile } = await supabase
    .from('profile')
    .select('household_id')
    .eq('id', user.id)
    .single()
  if (!profile) return { error: 'Prófíll ekki fundinn' }

  const { error } = await supabase
    .from('shopping_item')
    .update({
      bought_at: new Date().toISOString(),
      bought_by_household_id: profile.household_id as string,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteShoppingItem(
  id: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Ekki innskráður' }

  const { data: profile } = await supabase.from('profile').select('role').eq('id', user.id).single()
  if (!profile) return { error: 'Prófíll ekki fundinn' }

  let query = supabase.from('shopping_item').delete().eq('id', id)
  if (profile.role !== 'head') {
    query = query.eq('created_by', user.id)
  }

  const { error } = await query
  if (error) return { error: error.message }
  return { success: true }
}
