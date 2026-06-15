'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveIcalUrl(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const url = (formData.get('ical_url') as string ?? '').trim()

  if (url && !url.endsWith('.ics')) {
    return { error: 'El URL debe terminar en .ics' }
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ical_url: url || null, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/calendar')
  return { success: true }
}
