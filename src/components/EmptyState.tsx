export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 sm:px-8 py-16 sm:py-24 min-h-[min(60vh,400px)]">
      <div className="mb-6 sm:mb-8 flex size-20 sm:size-24 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08]">
        <i className="ri-time-line text-4xl sm:text-5xl text-primary/50" />
      </div>
      <p className="max-w-[280px] text-center text-[15px] text-muted-foreground leading-relaxed">
        Нет активных столов. Добавьте стол, чтобы начать отслеживать таймеры.
      </p>
    </div>
  )
}
