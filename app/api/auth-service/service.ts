import type { SupabaseClient } from '@supabase/supabase-js'

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
