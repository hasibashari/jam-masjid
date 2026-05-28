'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Lock, Settings as SettingsIcon, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Silakan isi email dan password Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk. Periksa kembali kredensial Anda.');
      }

      // Successful login -> redirect to admin dashboard
      router.push('/admin');
      router.refresh(); // force next.js server components to re-run and recognize session

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat mencoba masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Background premium glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500 rounded-t-3xl"></div>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/30 mb-4 transform hover:scale-105 transition-transform duration-300">
            <SettingsIcon className="w-8 h-8 text-zinc-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans text-white uppercase">
            MASUK ADMIN
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-[280px]">
            Silakan masukkan email dan password untuk mengelola Digital Display Jam Masjid.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-rose-950/40 border border-rose-500/20 p-4 rounded-2xl text-rose-400 animate-slide-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-zinc-400 font-black tracking-widest uppercase ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@masjid.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-sm font-semibold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans placeholder:text-zinc-650"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-zinc-400 font-black tracking-widest uppercase ml-1">
              Kata Sandi
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-sm font-semibold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans placeholder:text-zinc-650"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#ebd586] active:scale-98 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded-2xl text-sm font-black tracking-wider transition-all uppercase cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Setup link fallback for fresh installations */}
        <div className="mt-8 text-center border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-500">
            Belum mengatur admin pertama kali?
          </p>
          <a
            href="/admin/register"
            className="text-xs text-[#D4AF37] hover:text-[#ebd586] font-bold tracking-tight inline-block mt-2 hover:underline transition-all"
          >
            Mulai Setup Akun Baru &rarr;
          </a>
        </div>

      </div>
    </div>
  );
}
