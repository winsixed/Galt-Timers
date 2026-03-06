import { Clock } from './Clock'

interface HeaderProps {
  title?: string
}

export function Header({ title = 'GALT TIMERS' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3.5 bg-background/95 backdrop-blur-xl border-b border-white/[0.08]">
      <h1 className="flex items-center gap-2 min-w-0 flex-1" title={title}>
        <img src="/favicon.svg" alt="" className="size-6 shrink-0 brightness-0 invert" aria-hidden />
        <span className="text-sm font-bold tracking-tight text-foreground truncate">
          {title}
        </span>
      </h1>
      <Clock />
    </header>
  )
}
