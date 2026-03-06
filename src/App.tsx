import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { Header } from './components/Header'
import { BottomBar } from './components/BottomBar'
import { EmptyState } from './components/EmptyState'
import { HookahCard } from './components/HookahCard'
import { AddTableModal } from './components/AddTableModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { SettingsModal } from './components/SettingsModal'
import { ReportsModal } from './components/ReportsModal'
import { TimerAlertModal } from './components/TimerAlertModal'

function parseTableNumber(name: string): number {
  const m = name.match(/\d+/)
  return m ? parseInt(m[0], 10) : 0
}

function getLastActivity(table: { startTime: number; hookahs: { atTableSince?: number; timer?: { endTime: number } | null }[] }): number {
  let max = table.startTime
  for (const h of table.hookahs) {
    if (h.atTableSince) max = Math.max(max, h.atTableSince)
    if (h.timer?.endTime) max = Math.max(max, h.timer.endTime)
  }
  return max
}

function AppContent() {
  const { tables, addTable, closeTable, settings, updateSettings, timerAlerts, dismissAllTimerAlerts, startNewShift } = useApp()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [confirmCloseTableId, setConfirmCloseTableId] = useState<string | null>(null)

  const sortedTables = [...tables].sort((a, b) => {
    switch (settings.tableSortOrder) {
      case 'number':
        return parseTableNumber(a.name) - parseTableNumber(b.name)
      case 'added':
        return a.startTime - b.startTime
      case 'activity':
        return getLastActivity(b) - getLastActivity(a)
      default:
        return 0
    }
  })

  const handleCloseTable = (tableId: string) => {
    setConfirmCloseTableId(tableId)
  }

  const handleConfirmClose = () => {
    if (confirmCloseTableId) {
      closeTable(confirmCloseTableId)
      setConfirmCloseTableId(null)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />

      <main className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 pb-24" role="main">
        {tables.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mx-auto max-w-6xl px-2 sm:px-4 pb-12 sm:pb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(160px,1fr)]">
              {sortedTables.map((table, i) => (
                <div key={table.id} className="animate-fade-in aspect-square w-full min-w-0 min-h-[160px]" style={{ animationDelay: `${i * 50}ms` }}>
                  <HookahCard
                    table={table}
                    onClose={() => handleCloseTable(table.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AddTableModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreate={addTable}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        onStartNewShift={startNewShift}
      />

      <ReportsModal
        isOpen={reportsOpen}
        onClose={() => setReportsOpen(false)}
      />

      <ConfirmDialog
        isOpen={confirmCloseTableId !== null}
        title="Закрыть стол?"
        message="Стол будет закрыт и добавлен в отчёт."
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmCloseTableId(null)}
      />

      <TimerAlertModal
        alerts={timerAlerts}
        onDismissAll={dismissAllTimerAlerts}
      />

      <BottomBar
        onAddTable={() => setAddModalOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onReports={() => setReportsOpen(true)}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
