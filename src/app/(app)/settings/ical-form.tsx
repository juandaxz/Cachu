'use client'

import { useState, useTransition } from 'react'
import { saveIcalUrl } from '@/app/actions/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'

export function IcalForm({ currentUrl }: { currentUrl: string }) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveIcalUrl(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ical_url">URL de tu calendario (.ics)</Label>
        <Input
          id="ical_url"
          name="ical_url"
          type="url"
          defaultValue={currentUrl}
          placeholder="https://aulavirtual.espol.edu.ec/feeds/calendars/user_..."
          className="text-xs"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="text-sm text-primary flex items-center gap-1">
          <Check className="h-4 w-4" /> Calendario conectado correctamente
        </p>
      )}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
