import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from "@/lib/supabase-server"

async function createClient() {
  return createServerSupabaseClient()
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email, name }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}