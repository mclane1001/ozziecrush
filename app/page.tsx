import SwipeDemo from '@/app/components/SwipeDemo'
import SignupForm from '@/app/components/SignupForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ozDark">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-display font-black text-2xl text-coral">OzzieCrush 🦘</span>
        <a
          href="#early-access"
          className="px-5 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-[#c93b21] transition-colors"
        >
          Get early access
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col lg:flex-row items-center gap-12 px-6 py-16 max-w-5xl mx-auto">
        <div className="flex-1 text-center lg:text-left">
          <p className="text-coral font-semibold text-sm uppercase tracking-widest mb-3">Made for Aussies 🇦🇺</p>
          <h1 className="font-display font-black text-5xl lg:text-6xl leading-tight mb-5">
            Find your<br />someone<br /><span className="text-coral">across Australia</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Real profiles, genuine connections. OzzieCrush is the dating app that puts safety and authenticity first — built for Australians, by Australians.
          </p>
          <div className="flex justify-center lg:justify-start">
            <a
              href="#early-access"
              className="px-8 py-4 rounded-full bg-coral text-white font-bold text-base hover:bg-[#c93b21] transition-colors shadow-lg"
            >
              Join the waitlist →
            </a>
          </div>
        </div>
        <div className="flex-shrink-0">
          <SwipeDemo />
        </div>
      </section>

      {/* Features */}
      <section className="bg-sand py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-black text-3xl text-center mb-12">Why OzzieCrush?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'Verified profiles', body: 'Optional ID verification gives you a trust badge and filters out fakes.' },
              { icon: '🛡️', title: 'Safety first', body: 'Report & block in two taps. Our Safety team reviews every report within 24 hrs.' },
              { icon: '🇦🇺', title: 'Built for Australia', body: 'Privacy Act 1988 compliant. Your data stays in Sydney — never leaves Australia.' },
              { icon: '🔒', title: 'No bot guarantee', body: 'Phone OTP at signup + AI moderation keeps bots off the platform.' },
              { icon: '💬', title: 'Icebreaker prompts', body: 'Suggested openers make starting a conversation easy — no more blank stares.' },
              { icon: '💳', title: 'Fair pricing', body: 'Free to match. Premium unlocks unlimited likes and profile boosts.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-muted text-sm">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="font-display font-black text-3xl text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create your profile', body: 'Sign up with your phone number, upload photos, write a short bio.' },
            { step: '2', title: 'Swipe & match', body: "Like profiles you're interested in. When it's mutual — it's a match!" },
            { step: '3', title: 'Start chatting', body: 'Send a message, share a voice note, or use our icebreaker prompts to break the ice.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-coral text-white font-black text-xl flex items-center justify-center mx-auto mb-4">{s.step}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-muted text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Early Access */}
      <section id="early-access" className="bg-coral py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[#FFF8F0] font-semibold text-sm uppercase tracking-widest mb-3">Launching soon</p>
          <h2 className="font-display font-black text-4xl text-white mb-4">Be the first to know</h2>
          <p className="text-[#F5E6D3] mb-8">Drop your email and we&apos;ll let you know the moment OzzieCrush goes live.</p>
          <div className="flex justify-center">
            <SignupForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ozDark text-[#F5E6D3] py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <span className="font-display font-black text-xl text-coral">OzzieCrush 🦘</span>
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="hover:text-coral transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-coral transition-colors">Terms of Service</a>
              <a href="/safety" className="hover:text-coral transition-colors">Safety</a>
              <a href="mailto:support@ozziecrush.com.au" className="hover:text-coral transition-colors">Contact</a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🇦🇺 Privacy Act 1988 compliant</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🛡️ Online Safety Act 2021</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">🔒 Data stored in Sydney, AU</span>
            <span className="text-xs bg-[#2a1f10] px-3 py-1 rounded-full">18+ only</span>
          </div>
          <p className="text-xs text-[#7A5C4A]">© 2026 OzzieCrush. All rights reserved. ABN TBC. ozziecrush.com.au</p>
        </div>
      </footer>

    </div>
  )
}
