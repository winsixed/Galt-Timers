import { useState, useEffect } from 'react'

export function useTimer(endTime: number | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(() => {
    if (!endTime) return null
    const r = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
    return r > 0 ? r : null
  })

  useEffect(() => {
    if (!endTime) {
      setRemaining(null)
      return
    }

    const tick = () => {
      const r = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      setRemaining(r > 0 ? r : null)
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return remaining
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Таймер, идущий вверх от since (в секундах) */
export function useElapsedTimer(since: number | undefined): number | null {
  const [elapsed, setElapsed] = useState<number | null>(() => {
    if (!since) return null
    return Math.max(0, Math.floor((Date.now() - since) / 1000))
  })

  useEffect(() => {
    if (!since) {
      setElapsed(null)
      return
    }

    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - since) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [since])

  return elapsed
}
