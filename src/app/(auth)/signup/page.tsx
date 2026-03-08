'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signupViaInvite } from '@/actions/auth'

function SignupForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) {
    return <p className="text-red-600">Ógilt boðshlekkur.</p>
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const result = await signupViaInvite(
      token,
      fd.get('name') as string,
      fd.get('email') as string,
      fd.get('password') as string,
    )
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nafn</label>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Netfang</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Lykilorð</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Stofnar aðgang...' : 'Stofna aðgang'}
      </button>
    </form>
  )
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-bold">Skráðu þig í Bær 524</h1>
        <Suspense fallback={<p>Hleður...</p>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
