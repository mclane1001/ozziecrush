'use client'
import { useState } from 'react'

const DEMO_PROFILES = [
  { name: 'Mia, 26', location: 'Sydney NSW', emoji: '👩‍🦰', bio: 'Beach runs & flat whites ☕' },
  { name: 'Jake, 29', location: 'Melbourne VIC', emoji: '🧔', bio: 'Footy tragic & home cook 🏉' },
  { name: 'Priya, 24', location: 'Brisbane QLD', emoji: '👩‍🦱', bio: 'Hiker, reader, terrible puns 📚' },
]

export default function SwipeDemo() {
  const [index, setIndex] = useState(0)
  const [anim, setAnim] = useState<'like' | 'pass' | null>(null)
  const profile = DEMO_PROFILES[index % DEMO_PROFILES.length]

  function swipe(dir: 'like' | 'pass') {
    setAnim(dir)
    setTimeout(() => {
      setIndex(i => i + 1)
      setAnim(null)
    }, 350)
  }

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div
        className="relative w-64 h-80 rounded-3xl shadow-2xl flex flex-col justify-end overflow-hidden transition-transform duration-300"
        style={{
          background: 'linear-gradient(160deg, #F5E6D3 0%, #FFF8F0 100%)',
          transform: anim === 'like' ? 'rotate(8deg) translateX(60px)' : anim === 'pass' ? 'rotate(-8deg) translateX(-60px)' : 'none',
          opacity: anim ? 0 : 1,
          transition: 'transform 0.35s ease, opacity 0.35s ease',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-8xl">{profile.emoji}</div>
        <div className="relative z-10 p-4 bg-gradient-to-t from-[#1A0F00cc] to-transparent rounded-b-3xl">
          <p className="text-white font-display font-bold text-lg leading-tight">{profile.name}</p>
          <p className="text-[#F5E6D3] text-sm">{profile.location}</p>
          <p className="text-[#F5E6D3] text-xs mt-1 opacity-80">{profile.bio}</p>
        </div>
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => swipe('pass')}
          className="w-14 h-14 rounded-full bg-white shadow-lg text-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Pass"
        >✕</button>
        <button
          onClick={() => swipe('like')}
          className="w-14 h-14 rounded-full bg-coral shadow-lg text-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Like"
        >❤️</button>
      </div>
      <p className="text-muted text-xs">Tap ❤️ or ✕ to try it</p>
    </div>
  )
}
