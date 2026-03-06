import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { useApp } from '../context/AppContext'

interface ReportsModalProps {
  isOpen: boolean
  onClose: () => void
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateHeader(ts: number) {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function coalLabel(n: number) {
  if (n === 1) return 'замена'
  if (n >= 2 && n <= 4) return 'замены'
  return 'замен'
}

export function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const { tables, reports, removeReport, deleteTable } = useApp()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; isActive: boolean } | null>(null)

  const activeEntries = tables.map((t) => ({
    id: t.id,
    tableName: t.name,
    startTime: t.startTime,
    coalReplacements: t.coalReplacements,
    isActive: true,
  }))

  const allEntries = [...activeEntries, ...reports.map((r) => ({ ...r, isActive: false }))]
    .sort((a, b) => b.startTime - a.startTime)

  const shiftDate = allEntries.length > 0
    ? formatDateHeader(Math.min(...allEntries.map((e) => e.startTime)))
    : null

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.isActive) {
        deleteTable(deleteTarget.id)
      } else {
        removeReport(deleteTarget.id)
      }
      setDeleteTarget(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-[min(400px,calc(100vw-2rem))] sm:max-w-[400px] max-h-[min(85vh,calc(100dvh-2rem))] flex flex-col p-4 sm:p-5 overflow-hidden rounded-3xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">
            Отчет{shiftDate && <span className="font-normal text-muted-foreground ml-1">· {shiftDate}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-1 px-1 py-2 min-h-0">
          {allEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Пока нет записей. Добавьте стол, чтобы начать.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {allEntries.map((r, i) => (
                <li
                  key={r.id}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2 sm:px-3 py-1.5 sm:py-2"
                >
                  <span className="text-muted-foreground text-xs tabular-nums">{i + 1}.</span>
                  <div className="min-w-0 flex items-center gap-1.5 overflow-hidden">
                    <span className="font-medium text-sm text-foreground truncate">{r.tableName}</span>
                    {r.isActive && (
                      <span className="text-[9px] font-medium uppercase tracking-wider text-primary bg-primary/15 px-1.5 py-0.5 rounded-full shrink-0">
                        В работе
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
                    {formatTime(r.startTime)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5">
                      <i className="ri-fire-line text-primary text-[10px]" />
                      <span className="font-semibold text-primary text-[10px] tabular-nums">
                        {r.coalReplacements}
                      </span>
                      <span className="text-[9px] text-muted-foreground hidden sm:inline">
                        {coalLabel(r.coalReplacements)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ id: r.id, isActive: r.isActive })}
                      aria-label="Удалить"
                      className="size-6 sm:size-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <i className="ri-delete-bin-line text-xs sm:text-sm" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Удалить запись?"
        message="Запись будет удалена без возможности восстановления."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Dialog>
  )
}
