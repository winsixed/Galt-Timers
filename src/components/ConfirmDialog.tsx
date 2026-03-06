import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[340px] rounded-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {title}
          </DialogTitle>
          {message && <p className="text-sm text-muted-foreground text-center mt-1">{message}</p>}
        </DialogHeader>
        <DialogFooter className="gap-3 sm:flex-row sm:justify-center pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-full min-h-[44px]">
            Нет
          </Button>
          <Button onClick={onConfirm} className="flex-1 rounded-full min-h-[44px]">
            Да
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
