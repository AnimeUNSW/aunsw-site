import { SparklesIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  busy?: boolean
  destructive?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  destructive = false,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const Icon = destructive ? TriangleAlertIcon : SparklesIcon

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!busy) onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className="overflow-hidden border-primary/30 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))] p-0 shadow-2xl sm:max-w-md"
        showCloseButton={!busy}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(24rem_12rem_at_10%_0%,color-mix(in_oklab,var(--color-accent)_24%,transparent),transparent_70%)]" />
        <DialogHeader className="relative gap-3 p-6 pb-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-xl border",
              destructive
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="relative mx-0 mb-0 rounded-none px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
