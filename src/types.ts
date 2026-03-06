export type HookahStatus =
  | 'preparing'      // Готовится
  | 'ready_confirm'  // Готов — ожидает подтверждения «Вынес»
  | 'at_table'       // За столом
  | 'coal_due'       // Пора менять уголь

export type TimerType = 'readiness' | 'coal'

export interface Timer {
  type: TimerType
  endTime: number  // timestamp
}

export interface Hookah {
  id: string
  name: string
  status: HookahStatus
  timer: Timer | null
  /** Время, когда кальян вынесли за стол (для таймера «за столом») */
  atTableSince?: number
  /** Когда таймер закончился и появилось уведомление (ready_confirm / coal_due) */
  alertSince?: number
}

export interface Table {
  id: string
  name: string
  hookahs: Hookah[]
  startTime: number
  coalReplacements: number
}

export interface ReportEntry {
  id: string
  tableName: string
  startTime: number
  coalReplacements: number
  endTime: number
}

export type SoundPreset = 'alarm' | 'siren' | 'pulse' | 'digital'
export type TableSortOrder = 'number' | 'added' | 'activity'

export interface Settings {
  /** 0 = Тест (10 сек), иначе минуты */
  coalIntervalMinutes: 0 | 10 | 15 | 20 | 25
  soundEnabled: boolean
  /** Уведомления в системе при скрытом браузере */
  browserNotificationsEnabled: boolean
  /** Мелодия уведомления */
  soundPreset: SoundPreset
  /** Сортировка столов на рабочем экране */
  tableSortOrder: TableSortOrder
}
