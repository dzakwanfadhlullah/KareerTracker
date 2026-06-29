import Link from "next/link";

export const metadata = { title: "Forgot Password — KareerTrack" };
export default function ForgotPasswordPage() {
  return <section className="auth-card"><p className="eyebrow">RESET PASSWORD</p><h1>Lupa password?</h1><p>Masukkan email akunmu. Kami akan mengirimkan instruksi untuk membuat password baru.</p><form><label><span>Email</span><input type="email" placeholder="email@kamu.com" /></label><button className="button button-primary" type="button">Send Reset Link</button></form><Link href="/login" className="auth-muted-link">Back to log in</Link></section>;
}
