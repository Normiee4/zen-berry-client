"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDragDialogProps {
  open: boolean
  direction: "to-mit" | "to-braindump" | null
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDragDialog({ open, direction, taskTitle, onConfirm, onCancel }: ConfirmDragDialogProps) {
  const isToMIT = direction === "to-mit"

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isToMIT ? "Promote to MIT?" : "Move to Brain Dump?"}</DialogTitle>
          <DialogDescription>
            {isToMIT
              ? `"${taskTitle}" will become one of your Top 3 Most Important Tasks.`
              : `"${taskTitle}" will be moved back to the Brain Dump list.`
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            className={isToMIT ? "bg-matcha hover:bg-matcha/90 text-white" : "bg-strawberry hover:bg-strawberry/80 text-foreground"}
            onClick={onConfirm}
          >
            {isToMIT ? "Promote" : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
