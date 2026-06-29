import Link from "next/link";

export const metadata = { title: "Register — KareerTrack" };
export default function RegisterPage() {
  return <section className="auth-card"><p className="eyebrow">CREATE ACCOUNT</p><h1>Mulai tracking apply kerja kamu.</h1><p>Simpan lowongan pertama dan pantau prosesnya sampai ada hasil.</p><form><label><span>Name</span><input placeholder="Nama kamu" /></label><label><span>Email</span><input type="email" placeholder="email@kamu.com" /></label><label><span>Password</span><input type="password" placeholder="Minimal 8 karakter" /></label><Link href="/dashboard" className="button button-primary">Create Account</Link></form><small>Sudah punya akun? <Link href="/login">Log in</Link></small></section>;
}
