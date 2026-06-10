import { NextRequest, NextResponse } from 'next/server'
import { resolveUser } from '@/lib/auth-helpers'
import { reorderPins } from '@/app/api/pins/service'

export async function POST(request: NextRequest) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    const result = await reorderPins(supabase, userId, items)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
