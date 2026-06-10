import { NextResponse } from 'next/server'
import * as pinService from '@/app/api/pins/service'
import { resolveUser } from '@/lib/auth-helpers'

export async function getPins(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pinService.fetchPins(supabase, userId)
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    const rows = (result.data ?? []) as pinService.PinRow[]

    return NextResponse.json(
      { pins: rows.map(pinService.formatPin) },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createPin(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { heading } = body

    if (!heading || typeof heading !== 'string') {
      return NextResponse.json({ error: 'Heading is required' }, { status: 400 })
    }

    const result = await pinService.insertPin(supabase, userId, {
      heading: heading.trim(),
      content: body.content,
      color: body.color,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(
      { pin: pinService.formatPin(result.data as pinService.PinRow) },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function updatePin(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, heading, content, color } = body

    if (!id) {
      return NextResponse.json({ error: 'Pin ID is required' }, { status: 400 })
    }

    if (heading !== undefined && (typeof heading !== 'string' || !heading.trim())) {
      return NextResponse.json({ error: 'Heading cannot be empty' }, { status: 400 })
    }

    const updates: { heading?: string; content?: string; color?: string } = {}
    if (heading !== undefined) updates.heading = heading.trim()
    if (content !== undefined) updates.content = content
    if (color !== undefined) updates.color = color

    const result = await pinService.modifyPin(supabase, userId, id, updates)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(
      { pin: pinService.formatPin(result.data as pinService.PinRow) },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function deletePin(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Pin ID is required' }, { status: 400 })
    }

    const result = await pinService.removePin(supabase, userId, id)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
