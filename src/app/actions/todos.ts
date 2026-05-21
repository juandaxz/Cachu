'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DEFAULT_CATEGORIES } from '@/lib/utils'
import type { Urgency, TodoStatus } from '@/lib/types'

export async function createTodo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const urgency = (formData.get('urgency') as Urgency) || 'medium'
  const category_id = (formData.get('category_id') as string) || null
  const deadline = (formData.get('deadline') as string) || null

  const { error } = await supabase.from('todos').insert({
    user_id: user.id,
    title,
    description,
    urgency,
    category_id: category_id || null,
    deadline: deadline ? new Date(deadline).toISOString() : null,
  })

  if (error) return { error: error.message }
  revalidatePath('/todos')
  return { success: true }
}

export async function updateTodoStatus(id: string, status: TodoStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('todos')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/todos')
  revalidatePath('/')
  return { success: true }
}

export async function deleteTodo(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('todos').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/todos')
  revalidatePath('/')
  return { success: true }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = formData.get('name') as string
  const color = (formData.get('color') as string) || '#6366f1'

  const { error } = await supabase.from('todo_categories').insert({
    user_id: user.id, name, color,
  })

  if (error) return { error: error.message }
  revalidatePath('/todos')
  return { success: true }
}

export async function ensureDefaultCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('todo_categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (existing && existing.length > 0) return

  await supabase.from('todo_categories').insert(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id, is_default: true }))
  )
}

export async function completeTodoFromDashboard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('todos')
    .update({ status: 'done' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/todos')
  return { success: true }
}

export async function updateTodo(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const urgency = formData.get('urgency') as Urgency
  const category_id = (formData.get('category_id') as string) || null
  const deadline = (formData.get('deadline') as string) || null

  const { error } = await supabase.from('todos')
    .update({
      title,
      description,
      urgency,
      category_id: category_id || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/todos')
  return { success: true }
}
