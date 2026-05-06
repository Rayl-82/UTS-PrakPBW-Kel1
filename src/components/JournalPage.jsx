'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { GreatIcon, GoodIcon, NeutralIcon, BadIcon, AwfulIcon } from '@/components/MoodIcons'
import { useToast } from './ToastProvider'

const moods = [
  { value: 'great',   label: 'Great',   Icon: GreatIcon   },
  { value: 'good',    label: 'Good',    Icon: GoodIcon    },
  { value: 'neutral', label: 'Neutral', Icon: NeutralIcon },
  { value: 'bad',     label: 'Bad',     Icon: BadIcon     },
  { value: 'awful',   label: 'Awful',   Icon: AwfulIcon   },
]

const formatDateParam = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const isToday = (date) => {
  const t = new Date()
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  )
}

const formatDisplay = (date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const formatPastEntry = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [pastEntries, setPastEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPastLoading, setIsPastLoading] = useState(true)
  const autoSaveRef = useRef(null)
  const dateInputRef = useRef(null)
  const isInitialLoad = useRef(true)
  const { showToast } = useToast()

  // Load entry for selected date
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      isInitialLoad.current = true
      const res = await fetch(`/api/journal?date=${formatDateParam(selectedDate)}`)
      const data = await res.json()
      if (data) {
        setContent(data.content || '')
        setMood(data.mood || null)
      } else {
        setContent('')
        setMood(null)
      }
      setSaveStatus('idle')
      setIsLoading(false)
      setTimeout(() => {
        isInitialLoad.current = false
      }, 100)
    }
    load()
  }, [selectedDate])

  // Load all past entries on mount
  useEffect(() => {
    fetch('/api/journal/all')
      .then((r) => r.json())
      .then((data) => {
        setPastEntries(Array.isArray(data) ? data : [])
        setIsPastLoading(false)
      })
  }, [])

  // Auto-save
  useEffect(() => {
    if (isInitialLoad.current) return
    if (content === '' && mood === null) return
    setSaveStatus('saving')
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(async () => {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mood,
          date: formatDateParam(selectedDate),
        }),
      })
      setSaveStatus('saved')
      fetch('/api/journal/all')
        .then((r) => r.json())
        .then((data) => setPastEntries(Array.isArray(data) ? data : []))
      showToast('Journal auto-saved successfully')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1500)
    return () => clearTimeout(autoSaveRef.current)
  }, [content, mood])

  // Manual save
  const handleSave = async () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    setSaveStatus('saving')
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        mood,
        date: formatDateParam(selectedDate),
      }),
    })
    setSaveStatus('saved')
    fetch('/api/journal/all')
      .then((r) => r.json())
      .then((data) => setPastEntries(Array.isArray(data) ? data : []))
    showToast('Journal saved successfully')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // Date navigation
  const goBack = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }
  const goForward = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }
  const goToday = () => setSelectedDate(new Date())

  const filteredPast = pastEntries.filter(
    (e) => e.date !== formatDateParam(selectedDate)
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto animate-slide-down">
        <div className="px-6 py-8 md:py-10 max-w-5xl mx-auto w-full">
          {/* Date navigator skeleton */}
          <div className="flex items-center gap-3 mb-8 flex-shrink-0">
            <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-56 h-9 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          
          {/* Main content area */}
          <div className="flex flex-col gap-8">
            {/* Editor card skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col animate-pulse min-h-[75vh]">
              <div className="h-3 bg-gray-100 rounded w-16 self-end mb-4" />
              <div className="flex-1 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-100 rounded" style={{width: `${70 + i * 5}%`}} />)}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="h-9 w-20 bg-gray-200 rounded-lg" />
              </div>
            </div>

            {/* Past Entries skeleton (horizontal) */}
            <div className="w-full flex flex-col flex-shrink-0 animate-pulse mt-auto pb-4">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="flex gap-4 overflow-x-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 min-w-[240px]">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto animate-slide-down">
      <div className="px-6 py-8 md:py-10 max-w-5xl mx-auto w-full">

        {/* Date Navigator */}
        <div className="flex items-center w-full mb-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E8520A] text-[#E8520A] font-medium text-sm hover:bg-orange-50 transition-colors min-w-[220px] justify-center"
              aria-label="Pick a date"
            >
              <CalendarDays size={16} />
              <span>{formatDisplay(selectedDate)}</span>
            </button>

            <input
              ref={dateInputRef}
              type="date"
              className="sr-only"
              value={formatDateParam(selectedDate)}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value + 'T00:00:00'))
                }
              }}
              aria-hidden="true"
              tabIndex={-1}
            />

            <button
              onClick={goForward}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isToday(selectedDate)
                  ? 'bg-[#E8520A] text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 mb-4">
          {/* Editor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col flex-shrink-0 min-h-[75vh]">
            {/* Character count */}
            <div className="text-right text-xs text-gray-400 mb-2">
              {content.length} characters
            </div>

            {/* Textarea */}
            <textarea
              className="flex-1 w-full resize-none outline-none text-sm text-gray-700 leading-relaxed placeholder-gray-300"
              placeholder="Start writing... let your thoughts flow."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Bottom row */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
              {/* Mood selector */}
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-3 hidden sm:inline">How&apos;s your day?</span>
                <div className="flex items-center gap-1">
                  {moods.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      onClick={() => setMood(mood === value ? null : value)}
                      aria-label={label}
                      className={`p-2 rounded-xl transition-all ${
                        mood === value
                          ? 'bg-[#FDF0EA] ring-2 ring-[#E8520A] opacity-100 scale-110'
                          : 'hover:bg-gray-50 opacity-60'
                      }`}
                    >
                      <Icon size={40} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="bg-[#E8520A] hover:bg-[#C94308] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Past Entries */}
          {isPastLoading ? (
            <div className="w-full flex flex-col flex-shrink-0 animate-pulse pb-4">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="flex gap-4 overflow-x-hidden">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 min-w-[240px] h-[160px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredPast.length > 0 && (
            <div className="w-full flex flex-col flex-shrink-0">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Past Entries</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-orange">
                {filteredPast.map((entry) => {
                  const moodConfig = moods.find((m) => m.value === entry.mood)
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedDate(new Date(entry.date + 'T00:00:00'))}
                      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#E8520A] transition-colors flex-shrink-0 min-w-[280px] max-w-[320px] h-[160px] flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Mood icon or placeholder */}
                        <div className="flex-shrink-0">
                          {moodConfig ? (
                            <moodConfig.Icon size={32} />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm"
                              aria-label="No mood"
                            >
                              📝
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {formatPastEntry(entry.date)}
                          </p>
                        </div>
                      </div>
                      
                      {entry.content && (
                        <p className="text-xs text-gray-500 line-clamp-5 mt-1 leading-relaxed">
                          {entry.content}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
