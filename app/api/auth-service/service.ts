import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from "@/lib/supabase-admin"

export const signUp = async (supabase: SupabaseClient, email: string, password: string, fullName?: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, has_onboarded: false } },
  })
}

export const signIn = async (supabase: SupabaseClient, email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async (supabase: SupabaseClient) => {
  return supabase.auth.signOut()
}

export const sendResetEmail = async (supabase: SupabaseClient, email: string, redirectTo: string) => {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo })
}

export const getSession = async (supabase: SupabaseClient) => {
  return supabase.auth.getSession()
}

export const deleteUser = async (userId: string) => {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  return { error }
}

export const updateUser = async (supabase: SupabaseClient, userId: string, data: Record<string, unknown>) => {
  return supabase.from('users').update(data).eq('user_id', userId)
}
