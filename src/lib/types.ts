export type HabitType = 'boolean' | 'count'
export type Urgency = 'low' | 'medium' | 'high' | 'risk'
export type TodoStatus = 'pending' | 'in_progress' | 'done'

export interface Habit {
  id: string
  user_id: string
  name: string
  type: HabitType
  color: string
  emoji: string
  archived: boolean
  created_at: string
}

export interface HabitCheckin {
  id: string
  habit_id: string
  user_id: string
  date: string
  value: number
  created_at: string
}

export interface HabitWithCheckins extends Habit {
  habit_checkins: HabitCheckin[]
}

export interface AntiHabit {
  id: string
  user_id: string
  name: string
  emoji: string
  start_date: string
  created_at: string
}

export interface AntiHabitCheckin {
  id: string
  anti_habit_id: string
  user_id: string
  date: string
  created_at: string
}

export interface AntiHabitJournal {
  id: string
  anti_habit_id: string
  user_id: string
  note: string
  created_at: string
}

export interface AntiHabitWithCheckins extends AntiHabit {
  anti_habit_checkins: AntiHabitCheckin[]
}

export interface TodoCategory {
  id: string
  user_id: string
  name: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  urgency: Urgency
  category_id: string | null
  deadline: string | null
  status: TodoStatus
  created_at: string
  updated_at: string
}

export interface TodoWithCategory extends Todo {
  todo_categories: TodoCategory | null
}
