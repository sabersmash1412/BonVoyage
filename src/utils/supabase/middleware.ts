import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Can't mutate the incoming request cookies in middleware; only set on the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options?: CookieOptions) {
          // Prefer deleting from the response. If not available, overwrite with expired cookie.
          try {
            response.cookies.delete(name)
          } catch {
            response.cookies.set({ name, value: '', maxAge: 0, ...options })
          }
        },
      },
    }
  )

  return { supabase, response }
}
