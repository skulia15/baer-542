import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDay } from '@/lib/dates'
import { ApproveDeclineForm } from '@/components/forms/approve-decline-form'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  pending_own_head: 'Bíður samþykkis eigin yfirmanns',
  pending_releasing_head: 'Bíður samþykkis losandi fjölskyldu',
  approved: 'Samþykkt',
  declined: 'Hafnað',
  cancelled: 'Afturkallað',
}

export default async function BidniDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const { requestId } = await params
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
  const { data: request } = await supabase
    .from('request')
    .select(
      '*, requesting_household:requesting_household_id(*), allocation:target_week_allocation_id(*, household:household_id(*))',
    )
    .eq('id', requestId)
    .single()

  if (!request) redirect('/tilkynningar')

  const allocation = request.allocation as {
    week_number: number
    household: { name: string } | null
  }
  const requestingHousehold = request.requesting_household as { name: string }

  const canApprove =
    profile?.role === 'head' &&
    (request.status === 'pending_own_head' || request.status === 'pending_releasing_head')

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/tilkynningar" className="text-blue-600">
          ←
        </Link>
        <h1 className="font-semibold">Beiðni</h1>
      </div>

      <div className="mb-4 rounded border border-gray-200 p-4">
        <p className="mb-2 text-sm font-medium">
          {requestingHousehold.name} óskar eftir dögum í viku {allocation.week_number}
          {allocation.household && ` (${allocation.household.name})`}:
        </p>
        <ul className="mb-3 space-y-1">
          {request.requested_days.map((d: string) => (
            <li key={d} className="text-sm">
              {formatDay(new Date(d))}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">
          Staða: {STATUS_LABELS[request.status] ?? request.status}
        </p>
        {request.decline_reason && (
          <p className="mt-1 text-xs text-red-600">Ástæða: {request.decline_reason}</p>
        )}
      </div>

      {canApprove && <ApproveDeclineForm type="request" id={requestId} />}
    </div>
  )
}
