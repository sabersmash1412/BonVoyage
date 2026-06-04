import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'

export default function useUserAuth() { 
    const router = useRouter();
    // page loading state while waiting for auth to finish
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const checkAuth = async () => {
            const supabase = createClient();

            if (!supabase) {
                console.error("Supabase client is not initialized.");
                return;  // Exit if supabase is not available
            }

            const { data: { session } } = await supabase.auth.getSession();

            // redirect if session is null
            if (!session) {
                router.push("/login");
            }
            // user has been auth and allow rest of page to load
            setLoading(false);
        };

        checkAuth();
    }, [router]);
    return { loading } 
}
