'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

const WORK_SECS = 40 * 60
const BREAK_SECS = 20 * 60

const BREAK_MSGS = [
  '¡Oye, descansa un rato! Te lo mereces 🎉',
  '¡40 minutos de concentración pura! Estira las piernas 💪',
  '¡Máquina! Tómate un descanso, tu cerebro te lo agradece 🌟',
  '¡Brutal sesión! Estos 20 minutitos son tuyos, aprovéchalos 🔥',
  '¡Eres increíble! Relájate un momento antes del siguiente bloque ✨',
  '¡Eso es dedicación! Descansa, toma agua y vuelves con todo 😎',
  '¡Lo lograste! 40 minutos sin distracciones. Ahora a recargar energías 🚀',
]

const WORK_MSGS = [
  '¡Vamos, que puedes con todo! 💪',
  '¡A romperla de nuevo! 🚀',
  '¡Recargado y listo para otro bloque! 🎯',
  '¡Otra ronda, otro logro! Tú puedes 🔥',
]

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const R = 80
const CIRC = 2 * Math.PI * R

export function PomodoroTimer() {
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(WORK_SECS)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const total = phase === 'work' ? WORK_SECS : BREAK_SECS
  const offset = CIRC * (timeLeft / total)

  // Countdown tick
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [isRunning, timeLeft])

  // Phase transition when time runs out
  useEffect(() => {
    if (timeLeft !== 0) return
    setIsRunning(false)
    if (phase === 'work') {
      setSessions(s => s + 1)
      setToast(BREAK_MSGS[Math.floor(Math.random() * BREAK_MSGS.length)])
      setPhase('break')
      setTimeLeft(BREAK_SECS)
    } else {
      setToast(WORK_MSGS[Math.floor(Math.random() * WORK_MSGS.length)])
      setPhase('work')
      setTimeLeft(WORK_SECS)
    }
  }, [timeLeft, phase])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 7000)
    return () => clearTimeout(id)
  }, [toast])

  function reset() {
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(WORK_SECS)
    setToast(null)
  }

  const isWork = phase === 'work'

  return (
    <div className="space-y-5">
      {toast && (
        <div
          className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground text-center cursor-pointer"
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Phase badge + session count */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
            isWork
              ? 'bg-primary/10 text-primary'
              : 'bg-green-500/10 text-green-600 dark:text-green-400'
          }`}>
            {isWork ? '📚 Estudio' : '☕ Descanso'}
          </span>
          {sessions > 0 && (
            <span className="text-xs text-muted-foreground">
              {sessions} {sessions === 1 ? 'sesión' : 'sesiones'}
            </span>
          )}
        </div>

        {/* Circular countdown */}
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90" aria-hidden>
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              strokeWidth="8"
              className="stroke-border"
            />
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC - offset}
              className={isWork ? 'stroke-primary' : 'stroke-green-500'}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-4xl font-mono font-bold text-foreground tabular-nums">
              {fmt(timeLeft)}
            </span>
            <span className="text-xs text-muted-foreground">
              {isWork ? `${WORK_SECS / 60} min enfoque` : `${BREAK_SECS / 60} min descanso`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            title="Reiniciar"
            className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsRunning(r => !r)}
            className={`px-8 py-2.5 rounded-xl font-medium text-sm transition-opacity flex items-center gap-2 ${
              isWork
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-green-500 text-white hover:opacity-90'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
        </div>
      </div>
    </div>
  )
}
