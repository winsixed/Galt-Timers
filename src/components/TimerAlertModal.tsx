import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import type { TimerAlert } from '../context/AppContext'
import { cn } from '@/lib/utils'
import { vibrate } from '../lib/notification'

interface TimerAlertModalProps {
  alerts: TimerAlert[]
  onDismissAll: () => void
}

export function TimerAlertModal({ alerts, onDismissAll }: TimerAlertModalProps) {
  useEffect(() => {
    if (alerts.length > 0) vibrate()
  }, [alerts.length])

  if (alerts.length === 0) return null

  const handleDismiss = () => {
    onDismissAll()
  }

  const single = alerts.length === 1
  const alert = alerts[0]

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="timer-alert-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
        onClick={handleDismiss}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-20 w-full shadow-2xl pointer-events-auto',
          'animate-in zoom-in-95 fade-in-0 duration-200',
          single
            ? 'max-w-[320px] rounded-2xl border p-6'
            : 'max-w-[320px] max-h-[85vh] overflow-y-auto rounded-2xl border p-6 border-white/20 bg-background/95 backdrop-blur-xl',
          single && alert.type === 'coal' && 'border-primary/30 bg-primary/10 shadow-[0_0_32px_rgba(240,140,0,0.15)]',
          single && alert.type === 'ready' && 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_32px_rgba(34,197,94,0.15)]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {single ? (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-full',
                  alert.type === 'coal' ? 'bg-primary/20' : 'bg-emerald-500/20'
                )}
              >
                <i
                  className={cn(
                    'text-3xl',
                    alert.type === 'coal' ? 'ri-fire-line text-primary' : 'ri-check-line text-emerald-400'
                  )}
                />
              </div>
              <div>
                <h2 id="timer-alert-title" className="text-xl font-semibold text-foreground">
                  {alert.type === 'coal' ? 'Замена угля!' : 'Готов!'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alert.type === 'coal'
                    ? `${alert.tableName} — пора менять уголь`
                    : `${alert.tableName} — кальян готов`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                'mt-4 w-full min-h-[56px] rounded-full font-semibold text-sm',
                'inline-flex items-center justify-center',
                'transition-colors active:scale-[0.98] select-none',
                '[touch-action:manipulation] cursor-pointer outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                alert.type === 'coal'
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-emerald-500 hover:bg-emerald-500/90 text-white'
              )}
              autoFocus
            >
              Понятно
            </button>
          </>
        ) : (
          <>
            <h2 id="timer-alert-title" className="sr-only">
              Уведомления таймеров
            </h2>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {alerts.map((a, i) => {
                const isCoal = a.type === 'coal'
                const title = isCoal ? 'Замена угля!' : 'Готов!'
                const message = isCoal
                  ? `${a.tableName} — пора менять уголь`
                  : `${a.tableName} — кальян готов`
                const cardStyle = isCoal
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-emerald-500/30 bg-emerald-500/10'
                const iconBgStyle = isCoal ? 'bg-primary/20' : 'bg-emerald-500/20'
                const iconStyle = isCoal ? 'ri-fire-line text-primary' : 'ri-check-line text-emerald-400'

                return (
                  <div
                    key={`${a.tableName}-${a.type}-${i}`}
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-2xl border p-5 text-center',
                      'animate-in fade-in-0 duration-200',
                      cardStyle
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={cn('flex size-12 items-center justify-center rounded-full', iconBgStyle)}>
                      <i className={cn('text-2xl', iconStyle)} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                'mt-4 w-full min-h-[56px] rounded-full font-semibold text-sm',
                'inline-flex items-center justify-center',
                'transition-colors active:scale-[0.98] select-none',
                '[touch-action:manipulation] cursor-pointer outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'bg-primary hover:bg-primary/90 text-primary-foreground'
              )}
              autoFocus
            >
              Понятно
            </button>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
