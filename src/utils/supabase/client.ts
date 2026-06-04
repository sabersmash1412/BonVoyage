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
            const cookie = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`));
            return cookie ? cookie.split('=')[1] : undefined;
          },
          set(name: string, value: string) {
            document.cookie = `${name}=${value}; Path=/; SameSite=Lax; Secure`;
          },
          remove(name: string) {
            document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
          },
        },
      }
    );
  }

  return supabaseClient;
}
