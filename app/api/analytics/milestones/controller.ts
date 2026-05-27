import { NextResponse } from 'next/server'
import * as milestonesService from './service'

export async function getMilestones(request: Request) {
  try {
    const supabase = milestonesService.createSupabaseClient(request)
    const { data, error: userError } = await milestonesService.getAuthenticatedUser(supabase)
    const user = data?.user ?? null

    if (userError || !user) {
      return NextResponse.json(
        { lifetimeTasks: 0, lifetimeCycles: 0, combinedTotal: 0 },
        { status: 200 }
      )
    }

    const lifetimeTasks = await milestonesService.fetchLifetimeTasks(supabase, user.id)

    return NextResponse.json(
      { lifetimeTasks, lifetimeCycles: 0, combinedTotal: lifetimeTasks },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
    )
  } catch (error) {
    console.error('Milestones error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
