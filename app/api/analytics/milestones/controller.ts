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

    const [lifetimeTasks, lifetimeCycles] = await Promise.all([
      milestonesService.fetchLifetimeTasks(supabase, user.id),
      milestonesService.fetchLifetimeCycles(supabase, user.id),
    ])

    const combinedTotal = lifetimeTasks + lifetimeCycles

    return NextResponse.json(
      { lifetimeTasks, lifetimeCycles, combinedTotal },
      { status: 200, headers: { 'Cache-Control': 'public, max-age=604800, s-maxage=604800' } }
    )
  } catch (error) {
    console.error('Milestones error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
