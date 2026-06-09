import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    const res = NextResponse.json({ ok: !error, error: error?.message })

    // Read cookie header from request and delete any cookies present (best-effort)
    const cookieHeader = request.headers.get('cookie') || ''
    const cookieNames = cookieHeader
      .split(/;\s*/)
      .map(c => c.split('=')[0])
      .filter(Boolean)

    // Also include known Supabase cookie names
    const known = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 'supabase-session', 'sb:token', '__host-supabase-auth-token', '__secure-supabase-auth-token']
    const toDelete = Array.from(new Set([...cookieNames, ...known]))

    for (const name of toDelete) {
      try { res.cookies.delete(name) } catch {}
    }

    return res
  } catch (err) {
    console.error('Server signout error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
