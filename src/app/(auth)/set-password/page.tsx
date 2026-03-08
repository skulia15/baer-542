'use client'

import { useState } from 'react'
import { setPassword } from '@/actions/auth'

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-xl font-bold">Setja lykilorð</h1>
        <p className="mb-6 text-sm text-gray-600">Veldu nýtt lykilorð til að halda áfram.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nýtt lykilorð</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Staðfesta lykilorð</label>
            <input
              name="password2"
              type="password"
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Vistar...' : 'Vista lykilorð'}
          </button>
        </form>
      </div>
    </div>
  )
}
