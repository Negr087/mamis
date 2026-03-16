'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'mama' | 'papa'>('mama');
  const [dueDate, setDueDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyGender, setBabyGender] = useState<string>('sorpresa');
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleComplete = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile role
    await supabase.from('profiles').update({ role }).eq('id', user.id);

    // Create pregnancy profile
    await supabase.from('pregnancy_profile').insert({
      user_id: user.id,
      due_date: dueDate,
      baby_name: babyName || null,
      baby_gender: babyGender,
      doctor_name: doctorName || null,
    });

    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-warm-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-brand-500' : 'bg-warm-200'}`} />
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-warm-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              ¡Felicitaciones!
            </h1>
            <p className="text-warm-500 text-sm mb-8">¿Quién va a usar la app?</p>
            <div className="flex gap-4 justify-center mb-8">
              {[
                { value: 'mama' as const, emoji: '🤰', label: 'Soy mamá' },
                { value: 'papa' as const, emoji: '👨', label: 'Soy papá' },
              ].map((r) => (
                <button key={r.value} onClick={() => setRole(r.value)}
                  className={`flex-1 py-6 rounded-2xl border-2 transition-all ${
                    role === r.value
                      ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10'
                      : 'border-warm-200 bg-white hover:border-warm-300'
                  }`}>
                  <div className="text-3xl mb-2">{r.emoji}</div>
                  <div className="text-sm font-semibold text-warm-700">{r.label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)}
              className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all">
              Siguiente →
            </button>
          </div>
        )}

        {/* Step 2: Due date */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h1 className="text-2xl font-bold text-warm-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Fecha probable de parto
            </h1>
            <p className="text-warm-500 text-sm mb-8">Si no la sabés exacta, poné una aproximada</p>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-4 bg-white border border-warm-200 rounded-xl text-center text-lg outline-none focus:border-brand-400 transition-colors mb-8"
              required />
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-white text-warm-600 rounded-full font-semibold text-sm border border-warm-200">
                ← Atrás
              </button>
              <button onClick={() => dueDate && setStep(3)}
                className="flex-1 py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50"
                disabled={!dueDate}>
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Baby details */}
        {step === 3 && (
          <div className="text-center">
            <div className="text-4xl mb-4">👶</div>
            <h1 className="text-2xl font-bold text-warm-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Sobre tu bebé
            </h1>
            <p className="text-warm-500 text-sm mb-6">Estos datos son opcionales</p>

            <div className="space-y-4 text-left mb-6">
              <div>
                <label className="block text-xs font-semibold text-warm-600 mb-1.5 uppercase tracking-wide">
                  ¿Ya eligieron nombre? (opcional)
                </label>
                <input type="text" value={babyName} onChange={(e) => setBabyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                  placeholder="Nombre del bebé" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-600 mb-2 uppercase tracking-wide">
                  ¿Saben el sexo?
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'niño', emoji: '💙', label: 'Niño' },
                    { value: 'niña', emoji: '💗', label: 'Niña' },
                    { value: 'sorpresa', emoji: '🎁', label: 'Sorpresa' },
                  ].map((g) => (
                    <button key={g.value} onClick={() => setBabyGender(g.value)}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        babyGender === g.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-warm-200 bg-white'
                      }`}>
                      <span className="mr-1">{g.emoji}</span> {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-600 mb-1.5 uppercase tracking-wide">
                  Nombre del obstetra (opcional)
                </label>
                <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors"
                  placeholder="Dr./Dra." />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3.5 bg-white text-warm-600 rounded-full font-semibold text-sm border border-warm-200">
                ← Atrás
              </button>
              <button onClick={handleComplete} disabled={loading}
                className="flex-1 py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50">
                {loading ? 'Guardando...' : '¡Empezar! 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
