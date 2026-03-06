import { cn } from '@/lib/utils'

export type TimerVariant = 'preparing' | 'at_table' | 'ready' | 'coal_due'

const VARIANT_STYLES: Record<TimerVariant, { stroke: string; label: string }> = {
  preparing: { stroke: 'stroke-sky-500', label: 'text-sky-400' },
  at_table: { stroke: 'stroke-slate-400', label: 'text-muted-foreground/80' },
  ready: { stroke: 'stroke-emerald-500', label: 'text-emerald-400' },
  coal_due: { stroke: 'stroke-primary', label: 'text-primary' },
}

interface CircularTimerProps {
  value: number
  time: string
  label: string
  /** Время «за столом» — показывается под label */
  elapsedTime?: string | null
  isAlert?: boolean
  variant?: TimerVariant
  className?: string
  size?: number
}

export function CircularTimer({
  value,
  time,
  label,
  elapsedTime,
  isAlert = false,
  variant = 'preparing',
  className,
  size = 160,
}: CircularTimerProps) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  const styles = VARIANT_STYLES[variant]

  return (
    <div
      className={cn(
        'relative flex flex-col items-center',
        isAlert && 'animate-[pulse-glow_2s_ease-in-out_infinite]',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Track — тонкая линия как в Apple Timer */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/[0.08]"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-[stroke-dashoffset] duration-500 ease-out',
            styles.stroke
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Крупные цифры как в Apple Clock/Timer */}
        <span className="font-semibold text-[2.25rem] tabular-nums tracking-tight text-foreground leading-none text-center">
          {time}
        </span>
        <span
          className={cn(
            'text-[11px] font-medium uppercase tracking-[0.2em] mt-2 text-center',
            styles.label
          )}
        >
          {label}
        </span>
        {elapsedTime && (
          <span className="text-[10px] text-muted-foreground/70 tabular-nums mt-0.5 text-center">
            {elapsedTime}
          </span>
        )}
      </div>
    </div>
  )
}
