'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { today } from '@/lib/utils'

export async function createAntiHabit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = formData.get('name') as string
  const emoji = (formData.get('emoji') as string) || '🚫'
  const start_date = (formData.get('start_date') as string) || today()

  const { error } = await supabase.from('anti_habits').insert({
    user_id: user.id, name, emoji, start_date,
  })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteAntiHabit(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('anti_habits').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function checkinAntiHabit(antiHabitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const date = today()
  const { error } = await supabase.from('anti_habit_checkins').upsert({
    anti_habit_id: antiHabitId, user_id: user.id, date,
  }, { onConflict: 'anti_habit_id,date' })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function uncheckinAntiHabit(antiHabitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('anti_habit_checkins')
    .delete()
    .eq('anti_habit_id', antiHabitId)
    .eq('user_id', user.id)
    .eq('date', today())

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function saveTemptationNote(antiHabitId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('anti_habit_journal').insert({
    anti_habit_id: antiHabitId, user_id: user.id, note,
  })

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

