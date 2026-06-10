import type { SupabaseClient } from '@supabase/supabase-js'

export interface PinRow {
  pin_id: string
  user_id: string
  heading: string
  content: string | null
  color: string
  position: number
  created_at: string
  updated_at: string
}

export interface FormattedPin {
  id: string
  heading: string
  content: string | null
  color: string
  position: number
  createdAt: string
  updatedAt: string
}

export const formatPin = (row: PinRow): FormattedPin => ({
  id: row.pin_id,
  heading: row.heading,
  content: row.content,
  color: row.color,
  position: row.position,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const fetchPins = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('pins')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
}

export const insertPin = async (
  supabase: SupabaseClient,
  userId: string,
  data: { heading: string; content?: string; color?: string; position?: number }
) => {
  const maxPos = await supabase
    .from('pins')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = data.position ?? (maxPos.data?.[0]?.position ?? -1) + 1

  return supabase
    .from('pins')
    .insert({
      user_id: userId,
      heading: data.heading,
      content: data.content ?? null,
      color: data.color ?? '#FFD1D1',
      position: nextPosition,
    })
    .select()
    .single()
}

export const modifyPin = async (
  supabase: SupabaseClient,
  userId: string,
  pinId: string,
  updates: { heading?: string; content?: string; color?: string }
) => {
  return supabase
    .from('pins')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('pin_id', pinId)
    .eq('user_id', userId)
    .select()
    .single()
}

export const removePin = async (
  supabase: SupabaseClient,
  userId: string,
  pinId: string
) => {
  return supabase
    .from('pins')
    .delete()
    .eq('pin_id', pinId)
    .eq('user_id', userId)
}

export const reorderPins = async (
  supabase: SupabaseClient,
  userId: string,
  items: { pin_id: string; position: number }[]
) => {
  const updates = items.map((item) => ({
    pin_id: item.pin_id,
    user_id: userId,
    position: item.position,
    updated_at: new Date().toISOString(),
  }))

  return supabase.from('pins').upsert(updates, { onConflict: 'pin_id' })
}
