import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDay } from '@/lib/dates'
import { ApproveDeclineForm } from '@/components/forms/approve-decline-form'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  pending_own_head: 'Bíður samþykkis eigin yfirmanns',
  pending_other_head: 'Bíður samþykkis annarrar fjölskyldu',
  approved: 'Samþykkt',
  declined: 'Hafnað',
  cancelled: 'Afturkallað',
}

export default async function SkiptiDetailPage({
  params,
}: {
  params: Promise<{ swapId: string }>
}) {
  const { swapId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('id', user.id)
    .single()
  const { data: swap } = await supabase
    .from('swap_proposal')
    .select(
      '*, household_a:household_a_id(*), household_b:household_b_id(*), allocation_a:allocation_a_id(*), allocation_b:allocation_b_id(*)',
    )
    .eq('id', swapId)
    .single()

  if (!swap) redirect('/tilkynningar')

  const canApprove =
    profile?.role === 'head' &&
    (swap.status === 'pending_own_head' || swap.status === 'pending_other_head')

  const hhA = swap.household_a as { name: string }
  const hhB = swap.household_b as { name: string }
  const allocA = swap.allocation_a as { week_number: number }
  const allocB = swap.allocation_b as { week_number: number }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/tilkynningar" className="text-blue-600">
          ←
        </Link>
        <h1 className="font-semibold">Skiptatillaga</h1>
      </div>

      <div className="mb-4 rounded border border-gray-200 p-4">
        <p className="mb-3 text-sm font-medium">
          {hhA.name} ↔ {hhB.name}
        </p>
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">
            {hhA.name} gefur (V.{allocA.week_number}):
          </p>
          {swap.days_a.map((d: string) => (
            <p key={d} className="text-sm">
              {formatDay(new Date(d))}
            </p>
          ))}
        </div>
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">
            {hhB.name} gefur (V.{allocB.week_number}):
          </p>
          {swap.days_b.map((d: string) => (
            <p key={d} className="text-sm">
              {formatDay(new Date(d))}
            </p>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Staða: {STATUS_LABELS[swap.status] ?? swap.status}
        </p>
        {swap.decline_reason && (
          <p className="mt-1 text-xs text-red-600">Ástæða: {swap.decline_reason}</p>
        )}
      </div>

      {canApprove && <ApproveDeclineForm type="swap" id={swapId} />}
    </div>
  )
}
