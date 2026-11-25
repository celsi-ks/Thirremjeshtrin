'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';

/** Vetëm rrugë të brendshme (p.sh. /mjeshtri/...), që lidhja ?next= të mos dërgojë jashtë faqes. */
function nextPath() {
  const n = new URLSearchParams(location.search).get('next') || '/profili';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/profili';
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await sb().auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return setMsg('Email ose fjalëkalim i gabuar.');
    router.push(nextPath());
  }
  async function signUp(e) {
    const form = e.currentTarget.form;
    if (!form.reportValidity()) return;
    if (pw.length < 8) return setMsg('Për llogari të re, fjalëkalimi duhet të ketë të paktën 8 shkronja.');
    setBusy(true);
    const { data, error } = await sb().auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + nextPath() } });
    setBusy(false);
    if (error) return setMsg(/pwned|leaked|weak/i.test(error.message) ? 'Ky fjalëkalim është i dobët ose i rrjedhur. Zgjidh një tjetër.' : error.message);
    if (data.session) return router.push(nextPath());
    setMsg('Kontrollo email-in dhe kliko lidhjen e konfirmimit, pastaj hyr.');
  }

  async function forgot() {
    if (!/\S+@\S+\.\S+/.test(email)) return setMsg('Shkruaj email-in tënd më sipër, pastaj kliko "Harrova fjalëkalimin".');
    setBusy(true);
    const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/fjalekalimi' });
    setBusy(false);
    if (error) return setMsg(/rate|seconds/i.test(error.message) ? 'Prit një minutë para se të kërkosh lidhje të re.' : error.message);
    setMsg('Nëse ky email ka llogari, të dërguam një lidhje për fjalëkalim të ri. Kontrollo edhe dosjen Spam.');
  }

  return (
    <div className="wrap narrow">
      <h1>Hyr ose krijo llogari</h1>
      <p className="mut">Klientët hyjnë për të lënë vlerësime dhe për të postuar kërkesa. Mjeshtrat hyjnë për të krijuar profilin që klientët t&apos;i gjejnë.</p>
      <form onSubmit={signIn}>
        <input type="email" placeholder="Email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Fjalëkalimi (të paktën 8 shkronja)" required minLength={6} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <div className="btns">
          <button className="btn" disabled={busy}>Hyr</button>
          <button className="btn ghost" type="button" disabled={busy} onClick={signUp}>Krijo llogari</button>
        </div>
      </form>
      <p style={{ marginTop: 12 }}><button type="button" className="linkbtn" disabled={busy} onClick={forgot}>Harrova fjalëkalimin</button></p>
      {msg && <p className="mut">{msg}</p>}
    </div>
  );
}
