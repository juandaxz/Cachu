import { createClient } from '@/lib/supabase/server'
import { PomodoroTimer } from '@/components/pomodoro-timer'
import { WaterTracker } from '@/components/water-tracker'

export default async function FocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const { data: waterLog } = await supabase
    .from('water_logs')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Focus</h1>

      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Sesión de Estudio</h2>
          <p className="text-sm text-muted-foreground">40 min de enfoque · 20 min de descanso</p>
        </div>
        <PomodoroTimer />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Agua del Día</h2>
          <p className="text-sm text-muted-foreground">Meta: 8 vasos diarios</p>
        </div>
        <WaterTracker initialCount={waterLog?.count ?? 0} />
      </section>
    </div>
  )
}
