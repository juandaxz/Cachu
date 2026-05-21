'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { today } from '@/lib/utils'
import type { HabitType } from '@/lib/types'

export async function createHabit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = formData.get('name') as string
  const type = (formData.get('type') as HabitType) || 'boolean'
  const color = (formData.get('color') as string) || '#10b981'
  const emoji = (formData.get('emoji') as string) || '✅'

  const { error } = await supabase.from('habits').insert({
    user_id: user.id, name, type, color, emoji,
  })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteHabit(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function archiveHabit(id: string, archived: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('habits').update({ archived }).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function checkinHabit(habitId: string, value: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const date = today()
  const { error } = await supabase.from('habit_checkins').upsert({
    habit_id: habitId, user_id: user.id, date, value,
  }, { onConflict: 'habit_id,date' })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uncheckinHabit(habitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('habit_checkins')
    .delete()
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .eq('date', today())

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}
