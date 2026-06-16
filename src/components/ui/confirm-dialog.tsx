'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  title: string
  description?: string
  onConfirm: () => void
  trigger: React.ReactNode
}

export function ConfirmDialog({ title, description, onConfirm, trigger }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <span onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
        {trigger}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {description && (
            <p className="text-sm text-muted-foreground -mt-2">{description}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(); setOpen(false) }}
              className="flex-1 rounded-lg bg-destructive py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
