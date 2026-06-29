import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell"><Link href="/" className="auth-brand"><span>K</span><p>KareerTrack<small>by MagangKareer</small></p></Link>{children}</main>;
}
