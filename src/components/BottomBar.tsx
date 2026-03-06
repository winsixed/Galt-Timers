import { Button } from '@/components/ui/button'

interface BottomBarProps {
  onAddTable: () => void
  onSettings: () => void
  onReports: () => void
}

export function BottomBar({ onAddTable, onSettings, onReports }: BottomBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3 bg-background/95 backdrop-blur-xl border-t border-white/[0.06] pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between w-full max-w-md gap-3 min-h-[44px]">
        {/* Отчеты */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onReports}
          aria-label="Отчеты"
          className="size-11 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors shrink-0"
        >
          <i className="ri-bar-chart-grouped-line text-[1.35rem]" />
        </Button>

        {/* Добавить стол — стекло */}
        <Button
          onClick={onAddTable}
          variant="outline"
          className="h-11 px-6 rounded-2xl gap-2 font-semibold border-white/20 bg-white/[0.08] backdrop-blur-md text-foreground hover:bg-primary/20 hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all shrink-0 shadow-none"
          aria-label="Добавить стол"
        >
          <i className="ri-add-circle-fill text-[1.15rem] text-primary" />
          Добавить стол
        </Button>

        {/* Настройки */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettings}
          aria-label="Настройки"
          className="size-11 rounded-2xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors shrink-0"
        >
          <i className="ri-settings-4-line text-[1.35rem]" />
        </Button>
      </div>
    </nav>
  )
}
