"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const redirectTo = formData.get('redirectTo') as string || '/plan';
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/");
  return redirect(redirectTo);
}

export async function signup(
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const redirectTo = formData.get('redirectTo') as string || '/check-email';

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        email: formData.get("email") as string,
      },
    },
  });

  if (error) {
    console.log(error);
    return { error: error.message };
  }
  revalidatePath("/");
  return redirect(redirectTo);
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error(error);
    return redirect("/error");
  }
  revalidatePath("/");
  return redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.SITE_URL}/reset-password`, // Important!
  });
  if (error) {
    console.error(error);
    redirect("/error");
  }
  redirect("/check-email");
}