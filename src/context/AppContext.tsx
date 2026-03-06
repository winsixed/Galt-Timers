import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import type { Table, Hookah, Settings, ReportEntry } from '../types'
import { notify as notifyUser, showBrowserNotification } from '../lib/notification'
import { READINESS_MINUTES, TEST_INTERVAL_SECONDS } from '../constants'

const defaultSettings: Settings = {
  coalIntervalMinutes: 20,
  soundEnabled: true,
  browserNotificationsEnabled: false,
  soundPreset: 'digital',
  tableSortOrder: 'number',
}

const STORAGE_KEY = 'hookah-timer-state'
const SETTINGS_KEY = 'hookah-timer-settings'
const REPORTS_KEY = 'hookah-timer-reports'

function loadState(): Table[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Table[]
    const now = Date.now()
    const settings = loadSettings()
    const coalMin = getCoalMinutes(settings)
    return parsed.map((table) => ({
      ...table,
      startTime: table.startTime ?? now,
      coalReplacements: table.coalReplacements ?? 0,
      hookahs: table.hookahs.map((h) => {
        if (!h.timer) return h
        if (h.timer.endTime <= now) {
          if (h.timer.type === 'readiness') {
            return { ...h, status: 'ready_confirm' as const, timer: null, alertSince: h.alertSince ?? h.timer.endTime }
          }
          if (h.timer.type === 'coal') {
            return { ...h, status: 'coal_due' as const, timer: null, atTableSince: h.atTableSince ?? h.timer.endTime - coalMin * 60 * 1000, alertSince: h.alertSince ?? h.timer.endTime }
          }
        }
        if (h.status === 'at_table' && !h.atTableSince && h.timer.type === 'coal') {
          return { ...h, atTableSince: h.timer.endTime - coalMin * 60 * 1000 }
        }
        return h
      }),
    }))
  } catch {
    return []
  }
}

const VALID_COAL_MINUTES = [0, 10, 15, 20, 25] as const

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    const parsed = { ...defaultSettings, ...JSON.parse(raw) } as Settings
    const coal = parsed.coalIntervalMinutes
    if (!VALID_COAL_MINUTES.includes(coal as (typeof VALID_COAL_MINUTES)[number])) {
      parsed.coalIntervalMinutes = 20
    }
    const validPresets = ['alarm', 'siren', 'pulse', 'digital'] as const
    if (!validPresets.includes(parsed.soundPreset as (typeof validPresets)[number])) {
      parsed.soundPreset = 'digital'
    }
    const validTableSort = ['number', 'added', 'activity'] as const
    if (!validTableSort.includes(parsed.tableSortOrder as (typeof validTableSort)[number])) {
      parsed.tableSortOrder = 'number'
    }
    return parsed
  } catch {
    return defaultSettings
  }
}

function saveState(tables: Table[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables))
}

function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function loadReports(): ReportEntry[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveReports(reports: ReportEntry[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getCoalMinutes(settings: Settings): number {
  if (settings.coalIntervalMinutes === 0) return TEST_INTERVAL_SECONDS / 60
  return settings.coalIntervalMinutes
}

export interface TimerAlert {
  tableName: string
  type: 'ready' | 'coal'
}

interface AppContextValue {
  tables: Table[]
  reports: ReportEntry[]
  settings: Settings
  timerAlerts: TimerAlert[]
  dismissTimerAlert: () => void
  dismissAllTimerAlerts: () => void
  addTable: (tableNumber: number) => void
  closeTable: (tableId: string) => void
  removeReport: (reportId: string) => void
  startNewShift: () => void
  deleteTable: (tableId: string) => void
  confirmBroughtOut: (tableId: string, hookahId: string) => void
  confirmCoalReplaced: (tableId: string, hookahId: string) => void
  removeHookah: (tableId: string, hookahId: string) => void
  updateSettings: (settings: Partial<Settings>) => void
  tickTimers: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>(loadState)
  const [reports, setReports] = useState<ReportEntry[]>(loadReports)
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const [timerAlerts, setTimerAlerts] = useState<TimerAlert[]>([])
  const lastTick = useRef<number>(Date.now())

  useEffect(() => {
    saveState(tables)
  }, [tables])

  useEffect(() => {
    saveReports(reports)
  }, [reports])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const tickTimers = useCallback(() => {
    const now = Date.now()
    if (now - lastTick.current < 900) return
    lastTick.current = now
    const alertsToAdd: TimerAlert[] = []
    setTables((prev) => {
      let changed = false
      const next = prev.map((table) => ({
        ...table,
        hookahs: table.hookahs.map((h) => {
          if (!h.timer || h.timer.endTime > now) return h
          if (h.timer.type === 'readiness') {
            changed = true
            alertsToAdd.push({ tableName: table.name, type: 'ready' })
            notifyUser()
            return { ...h, status: 'ready_confirm' as const, timer: null, alertSince: h.timer.endTime }
          }
          if (h.timer.type === 'coal') {
            changed = true
            alertsToAdd.push({ tableName: table.name, type: 'coal' })
            notifyUser()
            return { ...h, status: 'coal_due' as const, timer: null, atTableSince: h.atTableSince ?? h.timer.endTime - getCoalMinutes(settings) * 60 * 1000, alertSince: h.timer.endTime }
          }
          return h
        }),
      }))
      return changed ? next : prev
    })
    if (alertsToAdd.length > 0) {
      const key = (a: TimerAlert) => `${a.tableName}|${a.type}`
      const seen = new Set<string>()
      const uniqueToAdd = alertsToAdd.filter((a) => {
        const k = key(a)
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      setTimerAlerts((prev) => {
        const prevKeys = new Set(prev.map(key))
        const newAlerts = uniqueToAdd.filter((a) => !prevKeys.has(key(a)))
        return newAlerts.length > 0 ? [...prev, ...newAlerts] : prev
      })
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden' &&
        settings.browserNotificationsEnabled &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        uniqueToAdd.forEach((a) => showBrowserNotification(a.tableName, a.type))
      }
    }
  }, [settings])

  useEffect(() => {
    const id = setInterval(tickTimers, 1000)
    return () => clearInterval(id)
  }, [tickTimers])

  const addTable = useCallback((tableNumber: number) => {
    const tableName = `Стол ${tableNumber}`
    const now = Date.now()
    const readinessSeconds = settings.coalIntervalMinutes === 0 ? TEST_INTERVAL_SECONDS : READINESS_MINUTES * 60
    const endTime = now + readinessSeconds * 1000

    const hookah: Hookah = {
      id: generateId(),
      name: 'Кальян',
      status: 'preparing',
      timer: { type: 'readiness', endTime },
    }

    setTables((prev) => [
      ...prev,
      {
        id: generateId(),
        name: tableName,
        hookahs: [hookah],
        startTime: now,
        coalReplacements: 0,
      },
    ])
  }, [settings])

  const closeTable = useCallback((tableId: string) => {
    const now = Date.now()
    const table = tables.find((t) => t.id === tableId)
    if (table) {
      setReports((r) => [
        {
          id: generateId(),
          tableName: table.name,
          startTime: table.startTime,
          coalReplacements: table.coalReplacements,
          endTime: now,
        },
        ...r,
      ])
    }
    setTables((prev) => prev.filter((t) => t.id !== tableId))
  }, [tables])

  const removeReport = useCallback((reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId))
  }, [])

  const startNewShift = useCallback(() => {
    setReports([])
    setTables([])
  }, [])

  const deleteTable = useCallback((tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
  }, [])

  const confirmBroughtOut = useCallback((tableId: string, hookahId: string) => {
    const now = Date.now()
    const coalMin = getCoalMinutes(settings)
    const endTime = now + coalMin * 60 * 1000

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              hookahs: t.hookahs.map((h) =>
                h.id === hookahId
                  ? { ...h, status: 'at_table' as const, timer: { type: 'coal', endTime }, atTableSince: now }
                  : h
              ),
            }
          : t
      )
    )
  }, [settings])

  const confirmCoalReplaced = useCallback((tableId: string, hookahId: string) => {
    const coalMin = getCoalMinutes(settings)
    const endTime = Date.now() + coalMin * 60 * 1000

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              coalReplacements: t.coalReplacements + 1,
              hookahs: t.hookahs.map((h) =>
                h.id === hookahId
                  ? { ...h, status: 'at_table' as const, timer: { type: 'coal', endTime }, atTableSince: h.atTableSince ?? Date.now() }
                  : h
              ),
            }
          : t
      )
    )
  }, [settings])

  const removeHookah = useCallback((tableId: string, hookahId: string) => {
    setTables((prev) =>
      prev
        .map((t) =>
          t.id === tableId
            ? { ...t, hookahs: t.hookahs.filter((h) => h.id !== hookahId) }
            : t
        )
        .filter((t) => t.hookahs.length > 0)
    )
  }, [])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }))
  }, [])

  const dismissTimerAlert = useCallback(() => {
    setTimerAlerts((prev) => prev.slice(1))
  }, [])

  const dismissAllTimerAlerts = useCallback(() => {
    setTimerAlerts([])
  }, [])

  const value: AppContextValue = {
    tables,
    reports,
    settings,
    timerAlerts,
    dismissTimerAlert,
    dismissAllTimerAlerts,
    addTable,
    closeTable,
    removeReport,
    startNewShift,
    deleteTable,
    confirmBroughtOut,
    confirmCoalReplaced,
    removeHookah,
    updateSettings,
    tickTimers,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
