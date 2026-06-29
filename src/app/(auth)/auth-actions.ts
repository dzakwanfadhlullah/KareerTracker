"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const loginSchema = z.object({
  email: z.email("Email belum valid."),
  password: z.string().min(1, "Password perlu diisi."),
  next: z.string().optional(),
});

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama perlu diisi.").max(120),
  email: z.email("Email belum valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

const resetSchema = z.object({
  email: z.email("Email belum valid."),
});

async function ensureProfileAndPreferences(name?: string | null) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.email) return;

  await supabase.from("profiles").upsert({
    user_id: user.id,
    name: name || user.user_metadata?.name || user.email.split("@")[0],
    email: user.email,
  }, { onConflict: "user_id" });

  await supabase.from("user_preferences").upsert({
    user_id: user.id,
    timezone: "Asia/Jakarta",
    follow_up_after_days: 7,
    ghosted_after_days: 21,
    default_view: "today",
  }, { onConflict: "user_id" });
}

export async function loginAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase env belum diisi. Tambahkan env vars dulu di local/Vercel." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data login belum valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  await ensureProfileAndPreferences();
  redirect(parsed.data.next || "/dashboard");
}

export async function registerAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase env belum diisi. Tambahkan env vars dulu di local/Vercel." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data register belum valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  if (data.session) {
    await ensureProfileAndPreferences(parsed.data.name);
    redirect("/dashboard");
  }

  return {
    status: "success",
    message: "Akun dibuat. Cek email untuk konfirmasi, lalu login ke KareerTrack.",
  };
}

export async function resetPasswordAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase env belum diisi. Tambahkan env vars dulu di local/Vercel." };
  }

  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Email belum valid." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", message: "Link reset password sudah dikirim jika email terdaftar." };
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
