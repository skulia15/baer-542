'use client'

import { setPassword } from '@/actions/auth'
import { useState } from 'react'

export default function SetPasswordPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    const pw = fd.get('password') as string
    const pw2 = fd.get('password2') as string
    if (pw !== pw2) {
      setError('Lykilorðin stemma ekki')
      return
    }
    if (pw.length < 8) {
      setError('Lykilorð verður að vera a.m.k. 8 stafir')
      return
    }
    setLoading(true)
    const result = await setPassword(pw)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-stone-900">
            Setja lykilorð
          </h1>
          <p className="mt-1 text-sm text-stone-500">Veldu nýtt lykilorð til að halda áfram.</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Nýtt lykilorð
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Staðfesta lykilorð
              </label>
              <input
                name="password2"
                type="password"
                required
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-green-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Vistar...' : 'Vista lykilorð'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
