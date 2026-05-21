'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveTemptationNote } from '@/app/actions/anti-habits'
import { MOTIVATIONAL_MESSAGES } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { AntiHabit } from '@/lib/types'

interface Props {
  antiHabit: AntiHabit
  streak: number
}

export function TemptationModal({ antiHabit, streak }: Props) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [message] = useState(() => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)])

  function handleSave() {
    if (!note.trim()) return
    startTransition(async () => {
      await saveTemptationNote(antiHabit.id, note.trim())
      setSaved(true)
      setTimeout(() => {
        setOpen(false)
        setNote('')
        setSaved(false)
      }, 1500)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10 shrink-0">
          <AlertTriangle className="h-3 w-3" />
          <span className="hidden sm:inline">Estoy a punto de caer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{antiHabit.emoji}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center space-y-2">
            <p className="text-base font-semibold text-foreground">{message}</p>
            {streak > 0 && (
              <p className="text-sm text-muted-foreground">
                Llevas <span className="text-orange-400 font-bold">{streak} días</span> sin {antiHabit.name.toLowerCase()}.
                <br />No lo tires a la basura.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">¿Qué está disparando esto? (opcional)</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe lo que sientes ahora mismo..."
              rows={3}
            />
          </div>

          {saved ? (
            <div className="text-center text-sm text-emerald-400 font-medium py-2">
              ✓ Guardado. ¡Tú puedes!
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
              {note.trim() && (
                <Button className="flex-1" onClick={handleSave} disabled={isPending}>
                  Guardar nota
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
