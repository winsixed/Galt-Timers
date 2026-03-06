import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Settings, SoundPreset, TableSortOrder } from '../types'
import { playSoundPreview } from '../lib/notification'
import { ConfirmDialog } from './ConfirmDialog'

const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as { standalone?: boolean }).standalone)
const hasNotificationSupport = typeof Notification !== 'undefined'
const isSecureContext = typeof window !== 'undefined' && window.isSecureContext

const SOUND_PRESETS: { value: SoundPreset; label: string }[] = [
  { value: 'alarm', label: 'Будильник' },
  { value: 'siren', label: 'Сирена' },
  { value: 'pulse', label: 'Пульс' },
  { value: 'digital', label: 'Цифровой' },
]

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onUpdate: (s: Partial<Settings>) => void
  onStartNewShift: () => void
}

export function SettingsModal({ isOpen, onClose, settings, onUpdate, onStartNewShift }: SettingsModalProps) {
  const [permState, setPermState] = useState<'idle' | 'requesting' | 'done'>('idle')
  const [confirmNewShift, setConfirmNewShift] = useState(false)
  useEffect(() => {
    if (isOpen) setPermState('idle')
  }, [isOpen])
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-h-[min(90vh,calc(100dvh-2rem))] flex flex-col rounded-3xl overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <i className="ri-settings-4-line text-primary" />
            Настройки
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-6 py-4 -mx-1 px-1">
          <Button
            variant="outline"
            className="w-full rounded-2xl gap-2 font-semibold border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none"
            onClick={() => setConfirmNewShift(true)}
          >
            <i className="ri-refresh-line text-lg" />
            Открыть смену
          </Button>
          {/* Рабочий процесс */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[15px] font-medium">
              <i className="ri-fire-line text-primary text-base" />
              Интервал замены угля
            </label>
            <div className="grid grid-cols-5 gap-3">
              {([0, 10, 15, 20, 25] as const).map((mins) => {
                const isSelected = settings.coalIntervalMinutes === mins
                return (
                  <Button
                    key={mins}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`h-11 rounded-2xl font-medium ${!isSelected ? 'border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none' : ''}`}
                    onClick={() => onUpdate({ coalIntervalMinutes: mins })}
                  >
                    {mins === 0 ? 'Тест' : `${mins} мин`}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-2 text-[15px] font-medium">
              <i className="ri-sort-asc text-primary text-base" />
              Сортировка столов
            </label>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {(
                [
                  { value: 'number' as const, label: 'По номеру' },
                  { value: 'added' as const, label: 'По добавлению' },
                  { value: 'activity' as const, label: 'По времени' },
                ] as { value: TableSortOrder; label: string }[]
              ).map(({ value, label }) => {
                const isSelected = settings.tableSortOrder === value
                return (
                  <Button
                    key={value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 min-w-0 px-3 text-xs rounded-xl shrink-0 ${!isSelected ? 'border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none' : ''}`}
                    onClick={() => onUpdate({ tableSortOrder: value })}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Уведомления */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 font-medium text-[15px]">
              <i className="ri-volume-up-line text-primary text-base" />
              Звуковые уведомления
            </p>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked: boolean) => onUpdate({ soundEnabled: checked })}
            />
          </div>
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-2 text-[15px] font-medium">
              <i className="ri-music-2-line text-primary text-base" />
              Мелодия
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SOUND_PRESETS.map(({ value, label }) => {
                const isSelected = settings.soundPreset === value
                return (
                  <Button
                    key={value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-2xl ${!isSelected ? 'border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none' : ''}`}
                    onClick={() => {
                      onUpdate({ soundPreset: value })
                      playSoundPreview(value)
                    }}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 font-medium text-[15px]">
              <i className="ri-notification-3-line text-primary text-base" />
              Уведомления при скрытом браузере
            </p>
            <Switch
              checked={settings.browserNotificationsEnabled}
              disabled={!hasNotificationSupport || !isSecureContext || (hasNotificationSupport && Notification.permission === 'denied')}
              onCheckedChange={async (checked: boolean) => {
                if (!checked) {
                  onUpdate({ browserNotificationsEnabled: false })
                  return
                }
                if (!hasNotificationSupport || !isSecureContext) return
                if (Notification.permission === 'granted') {
                  onUpdate({ browserNotificationsEnabled: true })
                  return
                }
                if (Notification.permission === 'default') {
                  setPermState('requesting')
                  try {
                    const perm = await Notification.requestPermission()
                    setPermState('done')
                    onUpdate({ browserNotificationsEnabled: perm === 'granted' })
                  } catch {
                    setPermState('done')
                  }
                }
              }}
            />
          </div>

          {isSecureContext && isIOS && !isStandalone && (
            <p className="text-sm text-amber-500/90">
              На iPhone: нажмите «Поделиться» → «На экран Домой», затем откройте приложение с домашнего экрана и включите уведомления.
            </p>
          )}
          {isSecureContext && hasNotificationSupport && Notification.permission !== 'granted' && (
            <Button
              variant="outline"
              className="w-full rounded-2xl gap-2 border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none"
              disabled={permState === 'requesting'}
              onClick={async () => {
                setPermState('requesting')
                try {
                  const perm = await Notification.requestPermission()
                  setPermState('done')
                  if (perm === 'granted') onUpdate({ browserNotificationsEnabled: true })
                } catch {
                  setPermState('done')
                }
              }}
            >
              <i className="ri-notification-3-line text-base" />
              {permState === 'requesting' ? 'Запрос разрешения…' : 'Разрешить уведомления'}
            </Button>
          )}
          {hasNotificationSupport && Notification.permission === 'denied' && (
            <p className="text-sm text-amber-500/90">
              Уведомления заблокированы. В настройках браузера найдите этот сайт и разрешите уведомления.
            </p>
          )}
          {isSecureContext && !hasNotificationSupport && (
            <p className="text-sm text-muted-foreground">
              Ваш браузер не поддерживает уведомления.
            </p>
          )}
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} className="rounded-2xl border-white/20 bg-white/[0.08] hover:bg-primary/20 hover:border-primary/40 hover:text-primary shadow-none">
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        isOpen={confirmNewShift}
        title="Открыть смену?"
        message="Все столы и отчёты будут удалены. Начнётся новая смена."
        onConfirm={() => {
          onStartNewShift()
          setConfirmNewShift(false)
          onClose()
        }}
        onCancel={() => setConfirmNewShift(false)}
      />
    </Dialog>
  )
}
