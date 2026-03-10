import { useState, useCallback } from 'react'
import './App.css'
import en from './locales/en'
import es from './locales/es'

const LOCALES = { en, es }
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
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('lang')
    if (stored && LOCALES[stored]) return stored
    const browserLang = navigator.language.split('-')[0]
    return LOCALES[browserLang] ? browserLang : 'en'
  })
  const t = LOCALES[lang]

  const changeLang = useCallback((newLang) => {
    localStorage.setItem('lang', newLang)
    setLang(newLang)
  }, [])
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
      <div className="lang-selector">
        <select
          className="lang-select"
          value={lang}
          onChange={(e) => changeLang(e.target.value)}
          aria-label="Language"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
        <span className="lang-chevron material-icons">expand_more</span>
      </div>

      <h1>🐊 Later Alligator</h1>

      <section className="time-section">
        <label htmlFor="start-time">{t.startTime}</label>
        <input
          id="start-time"
          type="datetime-local"
          step="1"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </section>

      <section className="intervals-section">
        <h2>{t.intervals}</h2>
        {intervals.length === 0 && (
          <p className="empty-hint">{t.noIntervals}</p>
        )}
        {intervals.map((iv, index) => (
          <div key={iv.id} className="interval-row">
            <span className="interval-index">#{index + 1}</span>
            <input
              type="number"
              min="0"
              placeholder={t.quantity}
              value={iv.quantity}
              onChange={(e) => updateInterval(iv.id, 'quantity', e.target.value)}
            />
            <select
              value={iv.unit}
              onChange={(e) => updateInterval(iv.id, 'unit', e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {t.units[u]}
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
          {t.addInterval}
        </button>
      </section>

      <section className="result-section">
        <h2>{t.endTime}</h2>
        <div className="end-time-row">
          <div className="end-time">
            {isNaN(endTime) ? (
              <span className="invalid">{t.invalidStartTime}</span>
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
