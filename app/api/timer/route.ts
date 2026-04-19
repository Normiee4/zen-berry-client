import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

// GET User Made Preset Timers
export async function GET(request: Request) {
    try {

        const timers = await request.json();
        


    } catch {

    }
}

// Create Timer Preset
export async function POST(request:Request) {
    try {

    } catch {
        
    }
}