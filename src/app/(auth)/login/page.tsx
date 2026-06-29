import Link from "next/link";

export const metadata = { title: "Log in — KareerTrack" };
export default function LoginPage() {
  return <section className="auth-card"><p className="eyebrow">WELCOME BACK</p><h1>Log in to KareerTrack</h1><p>Lanjutkan tracking lamaran dan lihat apa yang perlu kamu kerjakan hari ini.</p><form><label><span>Email</span><input type="email" placeholder="email@kamu.com" /></label><label><span>Password</span><input type="password" placeholder="••••••••" /></label><Link href="/dashboard" className="button button-primary">Log in</Link></form><small>Belum punya akun? <Link href="/register">Register</Link></small><Link href="/forgot-password" className="auth-muted-link">Forgot password?</Link></section>;
}
