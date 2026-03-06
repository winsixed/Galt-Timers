import { useState, useEffect } from 'react'

const TZ = 'Asia/Bangkok'

function formatDateTime(now: Date): string {
  const weekday = now.toLocaleDateString('ru-RU', { timeZone: TZ, weekday: 'short' }).toUpperCase()
  const day = now.toLocaleDateString('ru-RU', { timeZone: TZ, day: 'numeric' })
  const time = now.toLocaleTimeString('ru-RU', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  return `${weekday}, ${day} ${time}`
}

export function Clock() {
  const [value, setValue] = useState('')

  useEffect(() => {
    const update = () => setValue(formatDateTime(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-sm sm:text-base font-medium tabular-nums text-foreground tracking-tight">
      {value}
    </span>
  )
}
