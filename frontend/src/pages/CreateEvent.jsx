import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { createEvent } from '../api'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    creator_name: '',
    event_type: 'fullday',
    start_date: null,
    end_date: null,
    quorum: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.title || !form.creator_name || !form.start_date || !form.end_date) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Strip milliseconds and timezone suffix for Python compatibility
      const fmt = (d) => d.toISOString().replace('Z', '').split('.')[0]
      const payload = {
        ...form,
        start_date: fmt(form.start_date),
        end_date: fmt(form.end_date),
      }
      const { data } = await createEvent(payload)
      navigate(`/event/${data.id}`)
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-muted hover:text-paper mb-8 flex items-center gap-2 transition-colors text-sm"
        >
          ← Back
        </button>

        <h1 className="font-display font-extrabold text-4xl mb-2">Create Event</h1>
        <p className="text-muted mb-8">Set up your scheduling poll in seconds.</p>

        <div className="space-y-5">
          <Field label="Your name *">
            <input
              className="input-base"
              placeholder="e.g. Alice"
              value={form.creator_name}
              onChange={e => set('creator_name', e.target.value)}
            />
          </Field>

          <Field label="Event title *">
            <input
              className="input-base"
              placeholder="e.g. Team sync, Project kickoff..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="Optional details..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          <Field label="Event type *">
            <div className="flex gap-3">
              {[['fullday', '📅 Full day'], ['timebased', '🕐 Time slots']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => set('event_type', val)}
                  className={`flex-1 py-3 rounded-xl font-display font-semibold text-sm transition-all border ${
                    form.event_type === val
                      ? 'bg-accent border-accent text-paper'
                      : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start *">
              <DatePicker
                selected={form.start_date}
                onChange={d => set('start_date', d)}
                showTimeSelect={form.event_type === 'timebased'}
                dateFormat={form.event_type === 'timebased' ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy'}
                timeFormat="HH:mm"
                placeholderText="Pick start"
                minDate={new Date()}
              />
            </Field>
            <Field label="End *">
              <DatePicker
                selected={form.end_date}
                onChange={d => set('end_date', d)}
                showTimeSelect={form.event_type === 'timebased'}
                dateFormat={form.event_type === 'timebased' ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy'}
                timeFormat="HH:mm"
                placeholderText="Pick end"
                minDate={form.start_date || new Date()}
              />
            </Field>
          </div>

          <Field label={`Quorum — minimum responses to declare a winner: ${form.quorum}`}>
            <input
              type="range"
              min={1}
              max={20}
              value={form.quorum}
              onChange={e => set('quorum', parseInt(e.target.value))}
              className="w-full accent-accent mt-1"
            />
          </Field>

          {error && (
            <div className="bg-no/10 border border-no/30 text-no px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 bg-accent text-paper font-display font-bold text-lg rounded-xl hover:bg-opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Creating...' : 'Create & Get Link →'}
          </button>
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fffffe;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: border-color 0.2s;
          outline: none;
        }
        .input-base:focus { border-color: #f25f4c; }
        .input-base::placeholder { color: #a7a9be; }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-2 font-display font-semibold">{label}</label>
      {children}
    </div>
  )
}
