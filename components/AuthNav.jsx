'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';
import { useUser } from '@/lib/useUser';

export default function AuthNav() {
  const { user, isAdmin, ready } = useUser();
  const router = useRouter();
  if (!ready) return <nav />;
  if (!user) return <nav><Link href="/hyr">Hyr</Link></nav>;
  return (
    <nav>
      {isAdmin && <Link href="/admin">Admin</Link>}
      <Link href="/profili">Profili im</Link>
      <a href="/" onClick={async (e) => { e.preventDefault(); await sb().auth.signOut(); router.push('/'); router.refresh(); }}>Dil</a>
    </nav>
  );
}
