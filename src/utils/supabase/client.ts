'use client'

import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null; 

export function createClient() {
  if (!supabaseClient && typeof window !== 'undefined') {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
            return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : undefined
          },
          set(name: string, value: string, options?: { maxAge?: number; path?: string; sameSite?: 'Lax'|'Strict'|'None'; secure?: boolean }) {
            const parts: string[] = [`${name}=${encodeURIComponent(value)}`]
            parts.push(`Path=${options?.path ?? '/'}`)
            parts.push(`SameSite=${options?.sameSite ?? 'Lax'}`)
            if (options?.secure ?? true) parts.push('Secure')
            if (typeof options?.maxAge === 'number') parts.push(`Max-Age=${options.maxAge}`)
            document.cookie = parts.join('; ')
          },
          remove(name: string) {
            document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
          },
        } as any,
      }
    );
  }

  return supabaseClient;
}
