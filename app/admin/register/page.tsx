'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, Settings as SettingsIcon, AlertTriangle, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false); // triggers if backend returns 403
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Silakan isi seluruh kolom formulir.');
      return;
    }

    if (password.length < 8) {
      setError('Password harus minimal terdiri dari 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Submit Registration
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const regData = await regRes.json();

      if (regRes.status === 403) {
        setIsLocked(true);
        setError(regData.error);
        return;
      }

      if (!regRes.ok) {
        throw new Error(regData.error || 'Gagal mendaftarkan admin baru.');
      }

      setSuccess(true);

      // 2. Perform Auto-Login for smooth user onboarding experience
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (loginRes.ok) {
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1500);
      } else {
        // Fallback to manual login
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat mendaftarkan akun.');
    } finally {
      setLoading(false);
    }
  };

  // Render a locked state if the admin is already registered
  if (isLocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none animate-fade-in">
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md relative z-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500 rounded-t-3xl"></div>
          
          <div className="w-16 h-16 bg-rose-950 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>

          <h1 className="text-xl font-black text-white tracking-tight uppercase mb-3">
            REGISTRASI TERKUNCI
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed mb-8">
            Sistem mendeteksi bahwa akun administrator utama sudah terdaftar di database masjid. Pendaftaran akun baru ditutup untuk mencegah penyusup.
          </p>

          <a
            href="/admin/login"
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-sm font-bold tracking-wider transition-all uppercase block text-center"
          >
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Background premium glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Top gold-emerald line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500 rounded-t-3xl"></div>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/30 mb-4 transform hover:scale-105 transition-transform duration-300">
            <UserPlus className="w-8 h-8 text-zinc-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans text-white uppercase">
            SETUP ADMINISTRATOR
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-[280px]">
            Konfigurasikan email dan kata sandi admin pertama untuk mengamankan Digital Display Masjid Anda.
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="flex flex-col items-center text-center py-6 animate-fade-in">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-2">Pendaftaran Sukses!</h3>
            <p className="text-xs text-zinc-400">Menghubungkan ke dashboard secara aman...</p>
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mt-4" />
          </div>
        ) : (
          <>
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
                  Password Baru
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-sm font-semibold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans placeholder:text-zinc-650"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-zinc-400 font-black tracking-widest uppercase ml-1">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none text-white text-sm font-semibold focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans placeholder:text-zinc-650"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-2xl text-sm font-black tracking-wider transition-all uppercase cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar & Masuk</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Return to Login link */}
        <div className="mt-8 text-center border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-500">
            Sudah menyelesaikan konfigurasi awal?
          </p>
          <a
            href="/admin/login"
            className="text-xs text-[#D4AF37] hover:text-[#ebd586] font-bold tracking-tight inline-block mt-2 hover:underline transition-all"
          >
            Masuk ke Panel Kontrol &rarr;
          </a>
        </div>

      </div>
    </div>
  );
}
