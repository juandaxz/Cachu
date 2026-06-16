'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export async function incrementWater() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const date = todayStr()
  const { data } = await supabase
    .from('water_logs')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  await supabase.from('water_logs').upsert(
    { user_id: user.id, date, count: (data?.count ?? 0) + 1 },
    { onConflict: 'user_id,date' }
  )
  revalidatePath('/focus')
}

export async function decrementWater() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const date = todayStr()
  const { data } = await supabase
    .from('water_logs')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  const newCount = Math.max(0, (data?.count ?? 0) - 1)
  await supabase.from('water_logs').upsert(
    { user_id: user.id, date, count: newCount },
    { onConflict: 'user_id,date' }
  )
  revalidatePath('/focus')
}
