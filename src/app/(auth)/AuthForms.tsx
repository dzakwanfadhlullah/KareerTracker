"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, resetPasswordAction, type AuthActionState } from "./auth-actions";

const initialState: AuthActionState = { status: "idle", message: "" };

function AuthMessage({ state }: { state: AuthActionState }) {
  if (state.status === "idle") return null;
  return <p className={`auth-message auth-message-${state.status}`} role="status">{state.message}</p>;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <section className="auth-card">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>Log in to KareerTrack</h1>
      <p>Lanjutkan tracking lamaran dan lihat apa yang perlu kamu kerjakan hari ini.</p>
      <form action={formAction}>
        <input type="hidden" name="next" value={next || "/dashboard"} />
        <label><span>Email</span><input name="email" type="email" placeholder="email@kamu.com" autoComplete="email" required /></label>
        <label><span>Password</span><input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required /></label>
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Logging in..." : "Log in"}</button>
      </form>
      <AuthMessage state={state} />
      <small>Belum punya akun? <Link href="/register">Register</Link></small>
      <Link href="/forgot-password" className="auth-muted-link">Forgot password?</Link>
    </section>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <section className="auth-card">
      <p className="eyebrow">CREATE ACCOUNT</p>
      <h1>Mulai tracking apply kerja kamu.</h1>
      <p>Simpan lowongan pertama dan pantau prosesnya sampai ada hasil.</p>
      <form action={formAction}>
        <label><span>Name</span><input name="name" placeholder="Nama kamu" autoComplete="name" required /></label>
        <label><span>Email</span><input name="email" type="email" placeholder="email@kamu.com" autoComplete="email" required /></label>
        <label><span>Password</span><input name="password" type="password" placeholder="Minimal 8 karakter" autoComplete="new-password" minLength={8} required /></label>
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Creating account..." : "Create Account"}</button>
      </form>
      <AuthMessage state={state} />
      <small>Sudah punya akun? <Link href="/login">Log in</Link></small>
    </section>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <section className="auth-card">
      <p className="eyebrow">RESET PASSWORD</p>
      <h1>Lupa password?</h1>
      <p>Masukkan email akunmu. Kami akan mengirimkan instruksi untuk membuat password baru.</p>
      <form action={formAction}>
        <label><span>Email</span><input name="email" type="email" placeholder="email@kamu.com" autoComplete="email" required /></label>
        <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Sending..." : "Send Reset Link"}</button>
      </form>
      <AuthMessage state={state} />
      <Link href="/login" className="auth-muted-link">Back to log in</Link>
    </section>
  );
}
