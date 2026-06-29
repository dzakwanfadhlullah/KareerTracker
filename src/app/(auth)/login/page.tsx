import { LoginForm } from "../AuthForms";

export const metadata = { title: "Log in — KareerTrack" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <>
      {params.error === "supabase_env_missing" && (
        <p className="auth-env-warning">Supabase belum dikonfigurasi, jadi dashboard diproteksi sampai env vars tersedia.</p>
      )}
      <LoginForm next={params.next} />
    </>
  );
}
