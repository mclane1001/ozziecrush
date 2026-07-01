'use client'
import { useState } from 'react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    // In prod this POSTs to /api/waitlist — for now just shows confirmation
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl mb-2">🦘</p>
        <p className="font-display font-bold text-xl text-coral">You&apos;re on the list!</p>
        <p className="text-muted text-sm mt-1">We&apos;ll email you when OzzieCrush launches.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-3 rounded-full border border-sand bg-white text-ozDark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-coral text-sm"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-full bg-coral text-white font-bold text-sm hover:bg-[#c93b21] transition-colors"
      >
        Get early access
      </button>
      {error && <p className="text-red-500 text-xs mt-1 sm:col-span-2">{error}</p>}
    </form>
  )
}
