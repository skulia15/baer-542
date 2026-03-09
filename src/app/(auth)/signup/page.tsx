'use client'

import { signupViaInvite } from '@/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SignupForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Ógildur boðshlekkur.</p>
    )
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
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Nafn
        </label>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
          Netfang
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
          Lykilorð
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-green-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
      >
        {loading ? 'Stofnar aðgang...' : 'Stofna aðgang'}
      </button>
    </form>
  )
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
            Bær 542
          </h1>
          <p className="mt-1 text-sm text-stone-500">Stofnaðu aðgang</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <Suspense fallback={<p className="text-sm text-stone-400">Hleður...</p>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
