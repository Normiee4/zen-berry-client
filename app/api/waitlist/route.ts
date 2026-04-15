import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

export async function POST(request: Request) {
  try {
      const {email, name} = await request.json();

      const {data, error} = await supabase
        .from('waitlist')
        .insert([{email, name}])
        

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
  } catch  {
    return NextResponse.json({error: "Internal Server Error"} , {status:500})
  }
}