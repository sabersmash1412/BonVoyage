'use client';

import { createBrowserClient } from '@supabase/ssr';


export async function signInWithGoogle() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/plan`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });  

  if (error) {
    console.error(error);
    // `redirect` from next/navigation is server-only; use client navigation here
    if (typeof window !== 'undefined') {
      window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
    }
    return;
  }
}