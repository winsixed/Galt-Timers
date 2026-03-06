import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddTableModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (tableNumber: number) => void
}

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function AddTableModal({ isOpen, onClose, onCreate }: AddTableModalProps) {
  const handleSelect = (num: number) => {
    onCreate(num)
    onClose()
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
          onClick={onClose}
        />
        <DialogPrimitive.Content
          aria-describedby="add-table-description"
          className={cn(
            'fixed bottom-0 left-0 right-0 z-[70]',
            'rounded-t-3xl border-t border-white/10 bg-background',
            'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom',
            'duration-300 outline-none'
          )}
        >
          <div className="flex flex-col gap-6 pt-6 px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Добавить стол</h2>
                <p id="add-table-description" className="text-sm text-muted-foreground mt-0.5">Выберите номер стола</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Закрыть"
                className="size-10 rounded-full"
              >
                <i className="ri-close-line text-xl" />
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {TABLE_NUMBERS.map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-14 min-h-[56px] rounded-2xl text-xl font-semibold hover:border-primary hover:text-primary hover:bg-primary/10 active:scale-[0.98] transition-all border-white/10 bg-white/[0.04]"
                  onClick={() => handleSelect(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
