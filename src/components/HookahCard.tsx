import type { Table } from '../types'
import type { TimerVariant } from './CircularTimer'
import { useTimer, useElapsedTimer, formatTime } from '../hooks/useTimer'
import { useApp } from '../context/AppContext'
import { vibrateOnClick } from '../lib/notification'
import { READINESS_MINUTES, TEST_INTERVAL_SECONDS } from '../constants'
import { Button } from '@/components/ui/button'
import { CircularTimer } from './CircularTimer'
import { cn } from '@/lib/utils'

const READINESS_SECONDS = READINESS_MINUTES * 60

interface HookahCardProps {
  table: Table
  onClose: () => void
}

const statusLabels: Record<string, string> = {
  preparing: 'до готовности',
  ready_confirm: 'Готов!',
  at_table: 'За столом',
  coal_due: 'Замена угля!',
}

const STATUS_ICONS: Record<string, string> = {
  preparing: 'ri-time-line',
  ready_confirm: 'ri-check-line',
  at_table: 'ri-user-smile-line',
  coal_due: 'ri-fire-line',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  preparing: 'bg-sky-500',
  ready_confirm: 'bg-emerald-500',
  at_table: 'bg-slate-400',
  coal_due: 'bg-primary',
}

const CARD_ALERT_STYLES: Record<string, string> = {
  ready_confirm: 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_32px_rgba(34,197,94,0.12)] animate-[pulse-glow-green_2s_ease-in-out_infinite]',
  coal_due: 'bg-primary/10 border-primary/30 shadow-[0_0_32px_rgba(240,140,0,0.12)] animate-[pulse-glow_2s_ease-in-out_infinite]',
}

function getProgressPercent(
  remaining: number | null,
  totalSeconds: number
): number | null {
  if (remaining === null) return null
  return Math.max(0, Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100))
}

export function HookahCard({ table, onClose }: HookahCardProps) {
  const { settings, confirmBroughtOut, confirmCoalReplaced } = useApp()
  const hookah = table.hookahs[0]
  if (!hookah) return null

  const remaining = useTimer(hookah.timer?.endTime ?? null)
  const atTableSince =
    hookah.atTableSince ??
    (hookah.status === 'at_table' && hookah.timer?.type === 'coal'
      ? hookah.timer.endTime - (settings.coalIntervalMinutes === 0 ? TEST_INTERVAL_SECONDS : settings.coalIntervalMinutes * 60) * 1000
      : undefined)
  const elapsedAtTable = useElapsedTimer(atTableSince)
  const alertElapsed = useElapsedTimer(hookah.alertSince)
  const isAlert = hookah.status === 'ready_confirm' || hookah.status === 'coal_due'
  const timerVariant: TimerVariant =
    hookah.status === 'ready_confirm' ? 'ready'
    : hookah.status === 'coal_due' ? 'coal_due'
    : hookah.status === 'at_table' ? 'at_table'
    : 'preparing'
  const totalSeconds =
    hookah.timer?.type === 'readiness'
      ? (settings.coalIntervalMinutes === 0 ? TEST_INTERVAL_SECONDS : READINESS_SECONDS)
      : (settings.coalIntervalMinutes === 0 ? TEST_INTERVAL_SECONDS : settings.coalIntervalMinutes * 60)
  const progressPercent = getProgressPercent(remaining, totalSeconds)

  const cardStyle = isAlert
    ? CARD_ALERT_STYLES[hookah.status]
    : 'bg-white/[0.05] border-white/[0.08]'
  const iconColor =
    hookah.status === 'preparing' ? 'text-sky-400'
    : hookah.status === 'ready_confirm' ? 'text-emerald-400'
    : hookah.status === 'at_table' ? 'text-slate-400'
    : 'text-primary'

  return (
    <div
      className={cn(
        'relative aspect-square w-full h-full min-w-0 min-h-[140px] overflow-hidden rounded-3xl p-3 sm:p-6 transition-smooth border',
        'grid grid-rows-[1fr_auto] items-center justify-items-center gap-0 text-center',
        'backdrop-blur-xl',
        cardStyle
      )}
    >
      {/* Номер стола — слева сверху */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 min-w-0 max-w-[55%] sm:max-w-none z-10">
        <span className={cn('flex size-2 rounded-full shrink-0', STATUS_DOT_COLORS[hookah.status])} />
        <span className="text-xs sm:text-sm font-semibold text-foreground/90 truncate">{table.name}</span>
      </div>

      {/* Иконка — справа сверху (только когда таймер идёт) */}
      {(hookah.status === 'preparing' || hookah.status === 'at_table') && (
        <div className={cn('absolute top-2 right-2 sm:top-4 sm:right-4 z-10', iconColor)}>
          <i className={cn(STATUS_ICONS[hookah.status], 'text-lg')} />
        </div>
      )}

      {remaining !== null && progressPercent !== null ? (
        <div className="flex flex-col items-center justify-center gap-0.5 w-full min-w-0 min-h-0 overflow-hidden self-center">
          <div className="scale-[0.65] sm:scale-100 origin-center flex flex-col items-center justify-center">
            <CircularTimer
              value={progressPercent}
              time={formatTime(remaining)}
              label={hookah.status === 'at_table' ? 'до замены' : statusLabels[hookah.status]}
              elapsedTime={(hookah.status === 'at_table' || hookah.status === 'coal_due') && elapsedAtTable !== null ? formatTime(elapsedAtTable) : null}
              isAlert={isAlert}
              variant={timerVariant}
              size={148}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 sm:py-6 min-w-0 overflow-hidden self-center gap-1">
          {hookah.status === 'ready_confirm' ? (
            <i className={cn(STATUS_ICONS.ready_confirm, 'text-3xl sm:text-4xl text-emerald-400')} />
          ) : hookah.status === 'coal_due' ? (
            <i className={cn(STATUS_ICONS.coal_due, 'text-3xl sm:text-4xl text-primary')} />
          ) : (
            <span className="font-semibold text-xl sm:text-[2rem] text-muted-foreground/40">—</span>
          )}
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70 text-center">
            {statusLabels[hookah.status]}
          </span>
          {(hookah.status === 'ready_confirm' || hookah.status === 'coal_due') && hookah.alertSince != null && (
            <span className="text-[10px] text-muted-foreground/60 tabular-nums mt-0.5">
              С {new Date(hookah.alertSince).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              {alertElapsed != null && alertElapsed >= 0 && (
                <> · {alertElapsed < 60 ? `${alertElapsed} с` : formatTime(alertElapsed)}</>
              )}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-full sm:max-w-[180px] min-w-0 px-0.5 sm:px-0 self-center">
        {hookah.status === 'ready_confirm' && (
          <Button
            onClick={() => {
              vibrateOnClick()
              confirmBroughtOut(table.id, hookah.id)
            }}
            className="w-full h-9 sm:h-11 gap-2 rounded-full font-semibold text-sm sm:text-base active:scale-[0.98] transition-transform bg-emerald-500 hover:bg-emerald-500/90 text-white"
          >
            <i className="ri-check-double-line text-lg" />
            Вынес за стол
          </Button>
        )}
        {hookah.status === 'coal_due' && (
          <Button
            onClick={() => {
              vibrateOnClick()
              confirmCoalReplaced(table.id, hookah.id)
            }}
            className="w-full h-9 sm:h-11 gap-2 rounded-full font-semibold text-sm sm:text-base active:scale-[0.98] transition-transform bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <i className="ri-fire-line text-lg" />
            Выполнено
          </Button>
        )}
        {hookah.status === 'at_table' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 sm:h-9 min-h-[36px] rounded-full text-muted-foreground border-white/15 hover:border-white/25 hover:bg-white/5 hover:text-foreground text-sm font-medium bg-transparent transition-smooth"
          >
            Завершить
          </Button>
        )}
      </div>
    </div>
  )
}
