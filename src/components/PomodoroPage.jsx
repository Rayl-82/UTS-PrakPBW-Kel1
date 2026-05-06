'use client'
import { useState, useEffect, useRef } from 'react'
import { Settings, RotateCcw, Play, Pause, SkipForward, X } from 'lucide-react'

export const TomatoIcon = ({ size = 40, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" 
    fill="none" xmlns="http://www.w3.org/2000/svg"
    className={className} style={style}>
    <path d="M30 10C30 10 27 5 22 6C22 6 25 11 30 10Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 10C30 10 30 5 35 4C35 4 35 10 30 10Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 10C30 10 34 6 39 8C39 8 36 12 30 10Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="30" cy="35" r="21" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M22 28C24 24 28 22 30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
)

const MODES = {
  pomodoro:   { label: 'Pomodoro',    minutes: 25 },
  shortBreak: { label: 'Short Break', minutes: 5  },
  longBreak:  { label: 'Long Break',  minutes: 15 },
}

const THEMES = {
  pomodoro: {
    pageBg: 'bg-[#FFF5F0]', 
    primaryColor: '#E8520A',
    primaryBgClass: 'bg-[#E8520A]',
    primaryHoverClass: 'hover:bg-[#C94308]',
    textClass: 'text-[#E8520A]',
    focusRingClass: 'focus:ring-[#E8520A]',
    glowClass: 'shadow-[0_0_50px_rgba(232,82,10,0.15)]',
  },
  shortBreak: {
    pageBg: 'bg-[#F0F9FF]', 
    primaryColor: '#0EA5E9',
    primaryBgClass: 'bg-[#0EA5E9]',
    primaryHoverClass: 'hover:bg-[#0284C7]',
    textClass: 'text-[#0EA5E9]',
    focusRingClass: 'focus:ring-[#0EA5E9]',
    glowClass: 'shadow-[0_0_50px_rgba(14,165,233,0.15)]',
  },
  longBreak: {
    pageBg: 'bg-[#F0FDFA]', 
    primaryColor: '#14B8A6',
    primaryBgClass: 'bg-[#14B8A6]',
    primaryHoverClass: 'hover:bg-[#0D9488]',
    textClass: 'text-[#14B8A6]',
    focusRingClass: 'focus:ring-[#14B8A6]',
    glowClass: 'shadow-[0_0_50px_rgba(20,184,166,0.15)]',
  }
}

export default function PomodoroPage() {
  const [mode, setMode] = useState('pomodoro')
  const [customMinutes, setCustomMinutes] = useState({ 
    pomodoro: 25, shortBreak: 5, longBreak: 15 
  })
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef(null)

  const theme = THEMES[mode]

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, pomodorosCompleted, customMinutes])

  const handleTimerComplete = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.8)
    } catch (e) {
      console.error('Audio play failed', e)
    }

    if (mode === 'pomodoro') {
      const newCount = pomodorosCompleted + 1
      setPomodorosCompleted(newCount)
      if (newCount % 4 === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      switchMode('pomodoro')
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeft(customMinutes[newMode] * 60)
    clearInterval(intervalRef.current)
  }

  const handleSkip = () => {
    if (mode === 'pomodoro') {
      const newCount = pomodorosCompleted + 1
      setPomodorosCompleted(newCount)
      if (newCount % 4 === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      switchMode('pomodoro')
    }
  }

  const applySettings = () => {
    setShowSettings(false)
    setTimeLeft(customMinutes[mode] * 60)
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const totalSeconds = customMinutes[mode] * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-y-auto transition-colors duration-700 ease-in-out animate-slide-down ${theme.pageBg}`}>
      <div className="px-6 py-6 md:py-8 max-w-5xl mx-auto w-full flex justify-center items-center flex-1">
        
        <div className="flex flex-col w-full max-w-3xl">
          
          {/* Settings Modal */}
          {showSettings && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setShowSettings(false)}
            >
              <div 
                className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm mx-auto animate-slide-up transition-all relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Durations</h2>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5 font-medium">Pomodoro (minutes)</label>
                    <input 
                      type="number" min="1" max="60"
                      value={customMinutes.pomodoro}
                      onChange={e => setCustomMinutes(p => ({ ...p, pomodoro: parseInt(e.target.value) || 1 }))}
                      className={`border border-gray-200 rounded-xl px-4 py-2.5 text-base w-full focus:ring-2 ${theme.focusRingClass} focus:border-transparent outline-none transition-all duration-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5 font-medium">Short Break (minutes)</label>
                    <input 
                      type="number" min="1" max="60"
                      value={customMinutes.shortBreak}
                      onChange={e => setCustomMinutes(p => ({ ...p, shortBreak: parseInt(e.target.value) || 1 }))}
                      className={`border border-gray-200 rounded-xl px-4 py-2.5 text-base w-full focus:ring-2 ${theme.focusRingClass} focus:border-transparent outline-none transition-all duration-300`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5 font-medium">Long Break (minutes)</label>
                    <input 
                      type="number" min="1" max="60"
                      value={customMinutes.longBreak}
                      onChange={e => setCustomMinutes(p => ({ ...p, longBreak: parseInt(e.target.value) || 1 }))}
                      className={`border border-gray-200 rounded-xl px-4 py-2.5 text-base w-full focus:ring-2 ${theme.focusRingClass} focus:border-transparent outline-none transition-all duration-300`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-600 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={applySettings}
                    className={`flex-1 ${theme.primaryBgClass} ${theme.primaryHoverClass} text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-300 shadow-md`}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Timer Card */}
          <div className={`w-full bg-white rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center relative transition-shadow duration-700 border border-white/50 z-10 ${theme.glowClass}`}>
            
            {/* Settings Button */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="absolute top-5 right-5 p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>

            {/* Mode tabs */}
            <div className="flex gap-2 bg-gray-100/80 rounded-2xl p-1.5 mb-8 w-full max-w-xl justify-center shadow-inner">
              {Object.entries(MODES).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className={`flex-1 px-6 py-3 text-sm md:text-base font-medium rounded-xl transition-all duration-500 whitespace-nowrap ${
                    mode === key 
                      ? `bg-white shadow-sm ${theme.textClass}` 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Circular progress ring */}
            <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 360 360">
                <circle cx="180" cy="180" r="164" fill="none" stroke="#F3F4F6" strokeWidth="12"/>
                <circle cx="180" cy="180" r="164"
                  fill="none" stroke={theme.primaryColor} strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 164}`}
                  strokeDashoffset={`${2 * Math.PI * 164 * (1 - Math.max(0, Math.min(100, progress))/100)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.7s ease-in-out' }}
                />
              </svg>
              <div className="flex flex-col items-center justify-center relative z-10 transition-colors duration-700">
                <div className="text-6xl md:text-7xl font-bold text-gray-900 font-mono tracking-tighter mb-1">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-base md:text-lg text-gray-400 font-medium tracking-widest uppercase">
                  {MODES[mode].label}
                </div>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-6 mt-2">
              <button 
                onClick={() => {
                  setTimeLeft(customMinutes[mode] * 60); 
                  setIsRunning(false);
                  clearInterval(intervalRef.current);
                }}
                className="border-2 border-gray-100 bg-white rounded-2xl p-4 md:p-5 hover:bg-gray-50 hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-300 shadow-sm"
                title="Reset"
              >
                <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`${theme.primaryBgClass} ${theme.primaryHoverClass} text-white rounded-[2rem] px-12 py-5 md:px-16 md:py-6 shadow-xl transition-all duration-500 flex items-center justify-center transform hover:-translate-y-1`}
              >
                {isRunning ? <Pause className="w-8 h-8 md:w-12 md:h-12" /> : <Play className="w-8 h-8 md:w-12 md:h-12 ml-2" />}
              </button>

              <button 
                onClick={handleSkip}
                className="border-2 border-gray-100 bg-white rounded-2xl p-4 md:p-5 hover:bg-gray-50 hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-300 shadow-sm"
                title="Skip"
              >
                <SkipForward className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
