import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { call_id, message } = await req.json();

    if (!call_id || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing data' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('call_logs').insert({
      call_id,
      message,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

