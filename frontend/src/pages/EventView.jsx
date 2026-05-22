import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent, joinEvent, submitBulk, getResult } from '../api'
import { format } from 'date-fns'

const STATUS_CYCLE  = ['available', 'maybe', 'unavailable', null]
const STATUS_COLORS = { available: 'bg-yes text-paper', maybe: 'bg-maybe text-ink', unavailable: 'bg-no text-paper' }
const STATUS_ICONS  = { available: '✓', maybe: '?', unavailable: '✗' }
const STATUS_LABELS = { available: 'Available', maybe: 'Maybe', unavailable: 'Unavailable' }

export default function EventView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent]           = useState(null)
  const [result, setResult]         = useState(null)
  const [participant, setParticipant] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`participant_${id}`)) } catch { return null }
  })
  const [name, setName]     = useState('')
  const [joining, setJoining] = useState(false)
  const [responses, setResponses] = useState({})
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [copied, setCopied]   = useState(false)
  const [tab, setTab]         = useState('vote')

  const load = useCallback(async () => {
    const [ev, res] = await Promise.all([getEvent(id), getResult(id)])
    setEvent(ev.data)
    setResult(res.data)
    if (participant) {
      const mine = {}
      ev.data.slots.forEach(slot => {
        const r = slot.responses.find(r => r.participant_id === participant.id)
        if (r) mine[slot.id] = r.status
      })
      setResponses(mine)
    }
  }, [id, participant?.id])

  useEffect(() => { load() }, [load])

  const join = async () => {
    if (!name.trim()) return
    setJoining(true)
    try {
      const { data } = await joinEvent(id, name.trim())
      const p = data.participant
      localStorage.setItem(`participant_${id}`, JSON.stringify(p))
      setParticipant(p)
    } finally {
      setJoining(false)
    }
  }

  const toggleCell = (slotId) => {
    const current = responses[slotId] || null
    const idx = STATUS_CYCLE.indexOf(current)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setResponses(prev => ({ ...prev, [slotId]: next }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    const bulk = Object.entries(responses)
      .filter(([, s]) => s !== null)
      .map(([slot_id, status]) => ({ slot_id: parseInt(slot_id), status }))
    await submitBulk(participant.token, bulk)
    await load()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted font-display animate-pulse">Loading...</div>
    </div>
  )

  const maxScore = result?.all_slots_ranked?.[0]?.score || 0

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <button onClick={() => navigate('/')} className="text-muted hover:text-paper mb-3 flex items-center gap-1 transition-colors text-sm">
              ← Home
            </button>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs font-display font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-accent/20 text-accent">
                {event.event_type === 'fullday' ? '📅 Full day' : '🕐 Time slots'}
              </span>
              <span className="text-xs text-muted">
                Code: <strong className="text-paper font-mono">{event.id}</strong>
              </span>
            </div>
            <h1 className="font-display font-extrabold text-3xl mb-1">{event.title}</h1>
            {event.description && <p className="text-muted text-sm">{event.description}</p>}
            <p className="text-xs text-muted mt-1">Created by {event.creator_name}</p>
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-white/10 rounded-xl text-sm font-display font-semibold hover:bg-white/20 transition-all shrink-0"
          >
            {copied ? '✓ Copied!' : '🔗 Share link'}
          </button>
        </div>

        {/* Quorum banner */}
        {result?.quorum_reached && result?.best_slot && (
          <div className="mb-6 p-4 bg-yes/10 border border-yes/30 rounded-2xl flex items-start gap-3">
            <span className="text-2xl mt-0.5">🎉</span>
            <div>
              <div className="font-display font-bold text-yes">Quorum reached — best time found!</div>
              <div className="text-sm text-paper/80 mt-0.5">
                <strong>{formatSlot(result.best_slot, event.event_type)}</strong>
                {' · '}{result.best_slot.counts.available} available
                {', '}{result.best_slot.counts.maybe} maybe
                {' · '}score: {result.best_slot.score}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Participants', val: event.participant_count },
            { label: 'Quorum needed', val: event.quorum },
            { label: 'Time slots', val: event.slots.length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/5 rounded-xl px-4 py-3">
              <div className="font-display font-bold text-2xl">{val}</div>
              <div className="text-muted text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[['vote', '🗳 Vote'], ['results', '📊 Results']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-display font-semibold text-sm transition-all ${
                tab === t ? 'bg-accent text-paper' : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Join prompt */}
        {!participant && (
          <div className="mb-5 p-5 bg-white/5 border border-white/10 rounded-2xl">
            <p className="font-display font-semibold mb-3 text-sm">Enter your name to vote:</p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-paper placeholder-muted focus:outline-none focus:border-accent text-sm transition-colors"
                placeholder="Your name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && join()}
              />
              <button onClick={join} disabled={joining}
                className="px-5 py-3 bg-accent text-paper rounded-xl font-display font-semibold text-sm hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {joining ? '...' : 'Join →'}
              </button>
            </div>
          </div>
        )}

        {/* Voting controls */}
        {participant && (
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <span className="text-sm text-muted">
              Voting as <strong className="text-paper">{participant.name}</strong>
              <button
                onClick={() => { localStorage.removeItem(`participant_${id}`); setParticipant(null); setResponses({}) }}
                className="text-xs text-muted hover:text-no ml-2 underline"
              >
                not you?
              </button>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted hidden sm:block">Click cells to toggle: ✓ → ? → ✗</span>
              <button
                onClick={save}
                disabled={saving}
                className={`px-4 py-2 rounded-xl font-display font-semibold text-sm transition-all ${
                  saved ? 'bg-yes text-paper' : 'bg-accent text-paper hover:bg-opacity-90'
                } disabled:opacity-50`}
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save responses'}
              </button>
            </div>
          </div>
        )}

        {/* VOTE TAB */}
        {tab === 'vote' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-6 text-muted font-display font-semibold min-w-[160px]">Slot</th>
                  {event.participants.map(p => (
                    <th key={p.id} className="px-2 py-3 text-center text-muted font-display font-semibold min-w-[72px] text-xs">
                      {p.name}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-muted font-display font-semibold text-xs">Score</th>
                </tr>
              </thead>
              <tbody>
                {event.slots.map(slot => {
                  const isBest = result?.best_slot?.id === slot.id
                  return (
                    <tr key={slot.id} className={`border-t border-white/5 ${isBest ? 'bg-yes/5' : ''}`}>
                      <td className="py-2 pr-6">
                        <span className={`font-display font-semibold text-xs ${isBest ? 'text-yes' : 'text-paper'}`}>
                          {isBest && '★ '}{formatSlot(slot, event.event_type)}
                        </span>
                      </td>
                      {event.participants.map(p => {
                        const isMe = participant?.id === p.id
                        const status = isMe
                          ? (responses[slot.id] || null)
                          : (slot.responses.find(r => r.participant_id === p.id)?.status || null)
                        return (
                          <td key={p.id} className="px-2 py-2 text-center">
                            <button
                              disabled={!isMe}
                              onClick={() => isMe && toggleCell(slot.id)}
                              className={`w-9 h-9 rounded-lg font-bold text-sm transition-all mx-auto block
                                ${status ? STATUS_COLORS[status] : 'bg-white/5 text-transparent'}
                                ${isMe ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                              `}
                            >
                              {status ? STATUS_ICONS[status] : '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center">
                        <ScoreBar score={slot.score} max={maxScore} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {event.slots.length === 0 && (
              <p className="text-center text-muted py-12 text-sm">No time slots found for this event.</p>
            )}

            {/* Legend */}
            <div className="flex gap-5 mt-6 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2 text-xs text-muted">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${STATUS_COLORS[status]}`}>
                    {STATUS_ICONS[status]}
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div className="space-y-3">
            {result?.all_slots_ranked?.length === 0 && (
              <p className="text-muted text-sm text-center py-12">No responses yet. Be the first to vote!</p>
            )}
            {result?.all_slots_ranked?.map((slot, i) => {
              const total = slot.counts.available + slot.counts.maybe + slot.counts.unavailable
              const pct = (n) => total ? `${Math.round((n / total) * 100)}%` : '0%'
              return (
                <div key={slot.id} className={`p-4 rounded-2xl border transition-all ${
                  i === 0 && slot.score > 0 ? 'border-yes/40 bg-yes/5' : 'border-white/10 bg-white/3'
                }`}>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="font-display font-semibold text-sm">
                      {i === 0 && slot.score > 0 && <span className="text-yes mr-1">★</span>}
                      {formatSlot(slot, event.event_type)}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-yes">{slot.counts.available} ✓</span>
                      <span className="text-maybe">{slot.counts.maybe} ?</span>
                      <span className="text-no">{slot.counts.unavailable} ✗</span>
                      <span className="text-muted font-display font-bold">{slot.score} pts</span>
                    </div>
                  </div>
                  {total > 0 && (
                    <div className="h-1.5 rounded-full overflow-hidden bg-white/5 flex">
                      <div className="bg-yes transition-all" style={{ width: pct(slot.counts.available) }} />
                      <div className="bg-maybe transition-all" style={{ width: pct(slot.counts.maybe) }} />
                      <div className="bg-no transition-all" style={{ width: pct(slot.counts.unavailable) }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

function formatSlot(slot, eventType) {
  const start = new Date(slot.start_dt)
  return eventType === 'fullday'
    ? format(start, 'EEE, MMM d yyyy')
    : format(start, 'EEE, MMM d · HH:mm')
}

function ScoreBar({ score, max }) {
  if (max === 0) return <span className="text-muted text-xs">—</span>
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-yes rounded-full" style={{ width: `${Math.round((score / max) * 100)}%` }} />
      </div>
      <span className="text-xs text-muted w-3">{score}</span>
    </div>
  )
}
