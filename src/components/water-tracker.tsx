'use client'

import { useState, useTransition } from 'react'
import { incrementWater, decrementWater } from '@/app/actions/water'

const GOAL = 8

function WaterDrop({ count }: { count: number }) {
  const fill = Math.min(1, count / GOAL)

  return (
    <svg viewBox="0 0 100 125" className="w-32 h-40 drop-shadow-sm" aria-hidden>
      <defs>
        <clipPath id="water-clip">
          <rect
            x="-5" y="0" width="110" height="125"
            style={{
              transform: `translateY(${(1 - fill) * 100}%)`,
              transition: 'transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1)',
            }}
          />
        </clipPath>
      </defs>

      {/* Drop background */}
      <path
        d="M50 6 C50 6 10 52 10 78 A40 40 0 0 0 90 78 C90 52 50 6 50 6 Z"
        className="fill-sky-100 dark:fill-sky-950"
      />
      {/* Water fill */}
      <path
        d="M50 6 C50 6 10 52 10 78 A40 40 0 0 0 90 78 C90 52 50 6 50 6 Z"
        className="fill-sky-400 dark:fill-sky-500"
        clipPath="url(#water-clip)"
      />
      {/* Outline */}
      <path
        d="M50 6 C50 6 10 52 10 78 A40 40 0 0 0 90 78 C90 52 50 6 50 6 Z"
        fill="none"
        strokeWidth="2.5"
        className="stroke-sky-400 dark:stroke-sky-600"
      />
      {/* Shine */}
      <path
        d="M38 30 Q34 50 36 62"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-white/40"
      />
      {/* Count */}
      {count > 0 && (
        <text
          x="50" y="82"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="18"
          fontWeight="bold"
          style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.15)', strokeWidth: 3 }}
        >
          {count}
        </text>
      )}
    </svg>
  )
}

export function WaterTracker({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const done = count >= GOAL

  function add() {
    if (done) return
    setCount(c => c + 1)
    startTransition(() => incrementWater())
  }

  function undo() {
    if (count <= 0) return
    setCount(c => c - 1)
    startTransition(() => decrementWater())
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <WaterDrop count={count} />

      <div className="text-center space-y-1">
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {count}{' '}
          <span className="text-base font-normal text-muted-foreground">/ {GOAL} vasos</span>
        </p>
        {done ? (
          <p className="text-sm font-medium text-sky-500">¡Meta diaria cumplida! 💧</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {GOAL - count} {GOAL - count === 1 ? 'vaso' : 'vasos'} más para completar
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={add}
          disabled={done || isPending}
          className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💧 Tomé agua
        </button>
        {count > 0 && (
          <button
            onClick={undo}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Deshacer
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {Array.from({ length: GOAL }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i < count ? 'bg-sky-400' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
