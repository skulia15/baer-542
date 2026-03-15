'use server'

import { signInviteToken } from '@/lib/invite'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

async function buildInviteUrl(householdId: string): Promise<string> {
  const token = await signInviteToken(householdId)
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}/signup?token=${token}`
}

export async function adminGenerateInviteLink(
  householdId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Ekki innskráður' }

  const { data: profile } = await supabase
    .from('profile')
    .select('email')
    .eq('id', user.id)
    .single()
  if (profile?.email !== process.env.ADMIN_EMAIL)
    return { error: 'Aðeins admin getur búið til boðshlekk fyrir aðrar fjölskyldur' }

  const url = await buildInviteUrl(householdId)
  return { url }
}

export async function generateInviteLink(
  householdId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Ekki innskráður' }

  const { data: profile } = await supabase
    .from('profile')
    .select('role, household_id, email')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.email === process.env.ADMIN_EMAIL
  if (!profile || (profile.role !== 'head' && !isAdmin))
    return { error: 'Aðeins eigendur geta búið til boðshlekk' }
  if (profile.household_id !== householdId)
    return { error: 'Þú getur aðeins boðið í þína fjölskyldu' }

  const url = await buildInviteUrl(householdId)
  return { url }
}
