import type { SoundPreset } from '../types'

const SETTINGS_KEY = 'hookah-timer-settings'

function getSettings(): { soundEnabled?: boolean; soundPreset?: SoundPreset } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function shouldPlaySound(): boolean {
  const s = getSettings()
  return s.soundEnabled !== false
}

let audioContext: AudioContext | null = null

function playTone(ctx: AudioContext, freq: number, start: number, len: number, type: OscillatorType = 'sine', volume = 0.3) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.01, start + len)
  osc.start(start)
  osc.stop(start + len)
}

/** alarm: резкий будильник — быстрые повторяющиеся бипы */
function playAlarm(ctx: AudioContext, now: number) {
  ;[0, 0.15, 0.3, 0.45].forEach((d) => playTone(ctx, 880, now + d, 0.08, 'square', 0.4))
}

/** siren: тревожная сирена — восходящий тон */
function playSiren(ctx: AudioContext, now: number) {
  ;[600, 800, 1000, 1200].forEach((freq, i) => {
    playTone(ctx, freq, now + i * 0.08, 0.06, 'square', 0.4)
  })
}

/** pulse: пульсирующий сигнал */
function playPulse(ctx: AudioContext, now: number) {
  ;[0, 0.2, 0.4].forEach((d, i) => {
    playTone(ctx, i % 2 === 0 ? 1000 : 1200, now + d, 0.1, 'square', 0.4)
  })
}

/** digital: цифровой будильник */
function playDigital(ctx: AudioContext, now: number) {
  ;[0, 0.12, 0.24, 0.36, 0.48].forEach((d) => playTone(ctx, 1320, now + d, 0.06, 'square', 0.38))
}

const SOUND_PRESETS: Record<SoundPreset, (ctx: AudioContext, now: number) => void> = {
  alarm: playAlarm,
  siren: playSiren,
  pulse: playPulse,
  digital: playDigital,
}

function playSoundPreset() {
  if (!shouldPlaySound()) return
  const preset = SOUND_PRESETS[getSettings().soundPreset ?? 'digital'] ?? playDigital
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    const ctx = audioContext
    const now = ctx.currentTime
    preset(ctx, now)
  } catch {
    // ignore
  }
}

/** Паттерн для Android: длительность ≥1000 мс. Три импульса для более заметного отклика */
const VIBRATE_PATTERN = [1001, 120, 1001, 120, 1001]

/** iOS Safari: haptic через скрытый input[switch] (Safari 17.4+). Вызывать только из обработчика клика. */
function hapticIOS() {
  if (typeof window === 'undefined') return
  try {
    const label = document.createElement('label')
    label.setAttribute('aria-hidden', 'true')
    label.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.appendChild(input)
    document.body.appendChild(label)
    label.click()
    document.body.removeChild(label)
  } catch {
    // ignore
  }
}

/** Двойной haptic на iOS — более заметный отклик */
function hapticIOSStrong() {
  hapticIOS()
  setTimeout(hapticIOS, 80)
}

export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(VIBRATE_PATTERN)
    return
  }
  hapticIOS()
}

/** Вибрация/haptic при user gesture (клик). На iOS — двойной отклик. */
export function vibrateOnClick() {
  if (navigator.vibrate) {
    navigator.vibrate(VIBRATE_PATTERN)
    return
  }
  hapticIOSStrong()
}

export function notify() {
  vibrate()
  playSoundPreset()
  setTimeout(playSoundPreset, 500)
  setTimeout(playSoundPreset, 1000)
}

/** Прослушать мелодию (для выбора в настройках) */
export function playSoundPreview(preset?: SoundPreset) {
  if (!shouldPlaySound()) return
  const p = preset ?? getSettings().soundPreset ?? 'digital'
  const fn = SOUND_PRESETS[p] ?? playDigital
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    fn(audioContext, audioContext.currentTime)
  } catch {
    // ignore
  }
}

export type TimerAlertType = 'ready' | 'coal'

/** Системное уведомление при скрытой вкладке (требует разрешения) */
export function showBrowserNotification(tableName: string, type: TimerAlertType) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const title = type === 'coal' ? 'Замена угля!' : 'Готов!'
  const body = type === 'coal' ? `${tableName} — пора менять уголь` : `${tableName} — кальян готов`
  try {
    const n = new Notification(title, { body, icon: '/favicon.svg' })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    // ignore
  }
}
