"use server";

import { createClient } from "@/lib/supabase";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function signUpAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = signupSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile row
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: validated.data.name,
      email: validated.data.email,
    });
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
