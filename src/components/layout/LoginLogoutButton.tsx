'use client';
 
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, SupabaseClient } from "@supabase/supabase-js";

const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // wait until client is ready
    const client = createClient();
    setSupabaseClient(client);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    let mounted = true;
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabaseClient.auth.getUser();
        if (mounted) setUser(user);
      } catch (err) {
        console.error('Error fetching user', err);
        if (mounted) setUser(null);
      }
    };
    fetchUser();

    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        (data as any)?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, [supabaseClient]);

  if (!isMounted) return null; // Prevent hydration mismatch
  if (!supabaseClient) return <Button disabled>Loading...</Button>;

  const handleLogout = async () => {
    if (!supabaseClient) return;
    setIsLoggingOut(true);
    try {
      // Attempt server-side signout to clear HttpOnly cookies
      try {
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' })
      } catch (e) {
        console.error('Server signout fetch failed', e)
      }

      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Sign out error', error);
      }
    } catch (err) {
      // Supabase client may throw AuthSessionMissingError; proceed with cleanup anyway
      console.error('Sign out exception', err);
    } finally {
      // Clear client state and attempt to remove auth cookies/localStorage
      setUser(null);
      setIsLoggingOut(false);
      try {
        // Best-effort: remove common Supabase auth cookies
        const cookieNames = [
          'supabase-auth-token',
          'supabase-session',
          'sb-access-token',
          'sb-refresh-token',
          'sb:token'
        ];
        const allCookies = document.cookie.split('; ').map(c => c.split('=')[0]);
        allCookies.forEach(name => {
          const lower = name.toLowerCase();
          if (cookieNames.includes(name) || cookieNames.includes(lower) || lower.includes('supabase') || lower.startsWith('sb-') || lower.startsWith('sb:')) {
            document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
          }
        });
        // clear localStorage keys that may hold auth info
        try { localStorage.removeItem('sb-access-token'); } catch {}
        try { localStorage.removeItem('sb-refresh-token'); } catch {}
        // Redirect and hard reload to ensure middleware/server sees cleared cookies
        window.location.href = '/login';
      } catch (e) {
        try { router.replace('/login'); } catch {}
      }
    }
  };

  if (user) {
    return (
      <Button onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={() => router.push("/login")}>
      Login
    </Button>
  );
};

export default LoginButton;