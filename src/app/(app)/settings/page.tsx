import { createClient } from '@/lib/supabase/server'
import { IcalForm } from './ical-form'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('ical_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Calendario del Aula Virtual</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecta tu calendario de ESPOL para ver tus actividades y entregas directamente en la app.
          </p>
        </div>

        <div className="rounded-lg bg-secondary/50 border border-border p-3 space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground text-sm">¿Cómo obtener tu URL?</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Entra al Aula Virtual de ESPOL</li>
            <li>Ve a <strong>Calendario</strong> (menú lateral)</li>
            <li>Busca el botón <strong>"Exportar calendario"</strong> o <strong>"Subscribe"</strong></li>
            <li>Copia el URL que termina en <code className="bg-secondary px-1 rounded">.ics</code></li>
          </ol>
        </div>

        <IcalForm currentUrl={profile?.ical_url ?? ''} />
      </div>
    </div>
  )
}
