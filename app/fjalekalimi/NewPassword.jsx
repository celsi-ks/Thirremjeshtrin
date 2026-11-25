'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';

/** Lidhja nga email-i "Rivendos fjalëkalimin" hap këtë faqe me sesion të përkohshëm; këtu vendoset fjalëkalimi i ri. */
export default function NewPassword() {
  const router = useRouter();
  const [state, setState] = useState('loading'); // loading | ready | invalid
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // supabase-js e lexon sesionin nga lidhja (#access_token=...) vetë; presim pak që ta përfundojë.
    const { data: sub } = sb().auth.onAuthStateChange((ev, s) => { if (s) setState('ready'); });
    const err = new URLSearchParams(location.hash.slice(1)).get('error_description');
    const t = setTimeout(async () => {
      const { data } = await sb().auth.getSession();
      setState(data.session ? 'ready' : 'invalid');
      if (err) setMsg(err);
    }, 800);
    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  async function save(e) {
    e.preventDefault();
    if (pw.length < 8) return setMsg('Fjalëkalimi duhet të ketë të paktën 8 shkronja.');
    if (pw !== pw2) return setMsg('Fjalëkalimet nuk përputhen.');
    setBusy(true);
    const { error } = await sb().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg(/pwned|leaked|weak/i.test(error.message) ? 'Ky fjalëkalim është i dobët ose i rrjedhur. Zgjidh një tjetër.' : /same/i.test(error.message) ? 'Zgjidh një fjalëkalim të ndryshëm nga i vjetri.' : error.message);
    setMsg('✔ Fjalëkalimi u ndryshua.');
    setTimeout(() => router.push('/profili'), 1200);
  }

  return (
    <div className="wrap narrow">
      <h1>Fjalëkalim i ri</h1>
      {state === 'loading' && <p className="mut">Duke kontrolluar lidhjen…</p>}
      {state === 'invalid' && (
        <>
          <p className="mut">Lidhja ka skaduar ose është përdorur tashmë. Kërko një lidhje të re.</p>
          {msg && <p className="mut">{msg}</p>}
          <Link className="btn" href="/hyr">Kthehu te hyrja</Link>
        </>
      )}
      {state === 'ready' && (
        <form onSubmit={save}>
          <p className="mut">Shkruaj fjalëkalimin e ri për llogarinë tënde.</p>
          <input type="password" placeholder="Fjalëkalimi i ri (të paktën 8 shkronja)" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <input type="password" placeholder="Përsërite fjalëkalimin" required minLength={8} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          <button className="btn" disabled={busy}>Ruaj fjalëkalimin</button>
          {msg && <p className="mut">{msg}</p>}
        </form>
      )}
    </div>
  );
}
