'use client';

import { createBrowserClient } from '@supabase/ssr';


export async function signInWithGoogle() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Redirect to the login page so the client can process the OAuth response
      // and then forward the user to their original destination.
      redirectTo: `${siteUrl}/login`,
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
