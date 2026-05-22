import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvent } from '../api'

export default function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')

  const join = async () => {
    const id = code.trim()
    if (!id) return
    try {
      await getEvent(id)
      navigate(`/event/${id}`)
    } catch {
      setErr('Event not found. Check the code and try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-surface opacity-5 blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="mb-2 text-accent font-display font-bold text-sm tracking-widest uppercase">
          Schedule smarter
        </div>
        <h1 className="font-display font-extrabold text-6xl mb-4 leading-tight">
          Sync<span className="text-accent">Ora</span>
        </h1>
        <p className="text-muted text-lg mb-12">
          Find the time that works for everyone, without the back-and-forth.
        </p>

        <button
          onClick={() => navigate('/create')}
          className="w-full py-4 bg-accent text-paper font-display font-bold text-lg rounded-xl hover:bg-opacity-90 transition-all mb-4 hover:scale-[1.02] active:scale-[0.98]"
        >
          Create new event
        </button>

        <div className="relative flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-muted text-sm">or join with a code</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-paper placeholder-muted focus:outline-none focus:border-accent transition-colors"
            placeholder="Enter event code..."
            value={code}
            onChange={e => { setCode(e.target.value); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && join()}
          />
          <button
            onClick={join}
            className="px-5 py-3 bg-white/10 text-paper rounded-xl hover:bg-white/20 transition-all font-display font-semibold"
          >
            Join →
          </button>
        </div>
        {err && <p className="text-no mt-3 text-sm">{err}</p>}
      </div>
    </div>
  )
}
