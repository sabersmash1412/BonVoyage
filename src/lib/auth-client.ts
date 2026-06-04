'use client';

import { createBrowserClient } from '@supabase/ssr';
import { redirect } from "next/navigation";

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
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
}