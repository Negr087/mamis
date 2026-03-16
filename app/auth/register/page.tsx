'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/onboarding');
  };

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-warm-900" style={{ fontFamily: 'var(--font-display)' }}>
            Creá tu cuenta
          </h1>
          <p className="text-warm-500 text-sm mt-1">Empezá a seguir tu embarazo hoy</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5 uppercase tracking-wide">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
              placeholder="Tu nombre" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
              placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5 uppercase tracking-wide">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
              placeholder="Mínimo 6 caracteres" minLength={6} required />
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Registrarme gratis'}
          </button>
        </form>

        <p className="text-center text-sm text-warm-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/auth/login" className="text-brand-500 font-semibold hover:underline">Ingresá</Link>
        </p>
      </div>
    </main>
  );
}
