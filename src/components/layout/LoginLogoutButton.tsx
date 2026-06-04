'use client';
 
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, SupabaseClient } from "@supabase/supabase-js";

const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
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
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabaseClient]);

  if (!isMounted) return null; // Prevent hydration mismatch
  if (!supabaseClient) return <Button disabled>Loading...</Button>;

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.replace("/login");
  };

  if (user) {
    return <Button onClick={handleLogout}>Log out</Button>;
  }

  return (
    <Button variant="outline" onClick={() => router.push("/login")}>
      Login
    </Button>
  );
};

export default LoginButton;