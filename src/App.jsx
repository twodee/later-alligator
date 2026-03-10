import { useState, useCallback } from 'react'
import './App.css'

const UNITS = ['seconds', 'minutes', 'hours', 'days', 'years']

function toLocalDateTimeString(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

function addInterval(date, quantity, unit) {
  const d = new Date(date)
  const q = Number(quantity)
  if (unit === 'seconds') d.setSeconds(d.getSeconds() + q)
  else if (unit === 'minutes') d.setMinutes(d.getMinutes() + q)
  else if (unit === 'hours') d.setHours(d.getHours() + q)
  else if (unit === 'days') d.setDate(d.getDate() + q)
  else if (unit === 'years') d.setFullYear(d.getFullYear() + q)
  return d
}

function computeEndTime(startStr, intervals) {
  let result = new Date(startStr)
  for (const { quantity, unit } of intervals) {
    if (quantity !== '') {
      result = addInterval(result, quantity, unit)
    }
  }
  return result
}

let nextId = 1

function App() {
  const now = new Date()
  const [startTime, setStartTime] = useState(toLocalDateTimeString(now))
  const [intervals, setIntervals] = useState([])

  const addIntervalRow = useCallback(() => {
    setIntervals((prev) => [...prev, { id: nextId++, quantity: '', unit: 'hours' }])
  }, [])

  const removeIntervalRow = useCallback((id) => {
    setIntervals((prev) => prev.filter((iv) => iv.id !== id))
  }, [])

  const updateInterval = useCallback((id, field, value) => {
    setIntervals((prev) =>
      prev.map((iv) => (iv.id === id ? { ...iv, [field]: value } : iv))
    )
  }, [])

  const endTime = computeEndTime(startTime, intervals)

  const [copied, setCopied] = useState(false)

  const copyEndTime = useCallback(() => {
    if (isNaN(endTime)) return
    navigator.clipboard.writeText(endTime.toLocaleString()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [endTime])

  return (
    <div className="app">
      <h1>🐊 Later Alligator</h1>

      <section className="time-section">
        <label htmlFor="start-time">Start time</label>
        <input
          id="start-time"
          type="datetime-local"
          step="1"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </section>

      <section className="intervals-section">
        <h2>Intervals</h2>
        {intervals.length === 0 && (
          <p className="empty-hint">No intervals yet. Add one below.</p>
        )}
        {intervals.map((iv, index) => (
          <div key={iv.id} className="interval-row">
            <span className="interval-index">#{index + 1}</span>
            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={iv.quantity}
              onChange={(e) => updateInterval(iv.id, 'quantity', e.target.value)}
            />
            <select
              value={iv.unit}
              onChange={(e) => updateInterval(iv.id, 'unit', e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              className="remove-btn"
              onClick={() => removeIntervalRow(iv.id)}
              aria-label="Remove interval"
            >
              ✕
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={addIntervalRow}>
          + Add interval
        </button>
      </section>

      <section className="result-section">
        <h2>End time</h2>
        <div className="end-time-row">
          <div className="end-time">
            {isNaN(endTime) ? (
              <span className="invalid">Invalid start time</span>
            ) : (
              endTime.toLocaleString()
            )}
          </div>
          {!isNaN(endTime) && (
            <button
              className="copy-btn"
              onClick={copyEndTime}
              aria-label="Copy end time"
              title="Copy end time"
            >
              <span className="material-icons">
                {copied ? 'check' : 'content_copy'}
              </span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
