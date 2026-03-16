'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyInfo } from '@/hooks/useWeeklyInfo';
import { calculateWeek, progressPercent, daysRemaining, getTrimester, trimesterLabel } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import ProgressRing from '@/components/ui/ProgressRing';
import type { MedicalAppointment } from '@/types';

export default function DashboardPage() {
  const { user, profile, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();

  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;
  const { weekInfo } = useWeeklyInfo(currentWeek);

  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    if (!loading && user && !pregnancy) {
      router.push('/onboarding');
      return;
    }

    if (pregnancy) {
      supabase
        .from('medical_appointments')
        .select('*')
        .eq('pregnancy_id', pregnancy.id)
        .eq('is_completed', false)
        .order('appointment_date')
        .limit(3)
        .then(({ data }) => {
          if (data) setAppointments(data);
        });
    }
  }, [user, pregnancy, loading]);

  if (loading || !pregnancy || !currentWeek) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl animate-pulse-soft">🤰</div>
            <p className="text-warm-400 text-sm mt-3">Cargando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const progress = progressPercent(currentWeek);
  const days = daysRemaining(pregnancy.due_date);
  const trimester = getTrimester(currentWeek);

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8 animate-fade-in">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-warm-500 text-sm">Hola, {profile?.full_name?.split(' ')[0] || 'mamá'} 💛</p>
          <h1 className="text-2xl font-bold text-warm-900 mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {trimesterLabel(trimester)}
          </h1>
        </div>

        {/* Progress Ring Card */}
        <div className="bg-white rounded-3xl border border-warm-100 p-8 text-center mb-6 shadow-sm">
          <ProgressRing progress={progress} size={200}>
            <div>
              <div className="text-4xl mb-1">{weekInfo?.fruit_emoji || '🌱'}</div>
              <div className="text-3xl font-bold text-warm-900">
                {currentWeek}
              </div>
              <div className="text-xs text-warm-500 font-medium">semanas</div>
            </div>
          </ProgressRing>

          <div className="mt-6">
            <p className="text-warm-900 font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Tu bebé tiene el tamaño de
            </p>
            <p className="text-brand-600 font-bold text-xl mt-1">
              {weekInfo?.fruit_emoji} {weekInfo?.fruit_comparison}
            </p>
          </div>

          <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-warm-100">
            <div>
              <div className="text-lg font-bold text-warm-900">{days}</div>
              <div className="text-xs text-warm-500">días restantes</div>
            </div>
            {weekInfo?.baby_size_cm && (
              <div>
                <div className="text-lg font-bold text-warm-900">{weekInfo.baby_size_cm} cm</div>
                <div className="text-xs text-warm-500">tamaño</div>
              </div>
            )}
            {weekInfo?.baby_weight_grams && weekInfo.baby_weight_grams > 0 && (
              <div>
                <div className="text-lg font-bold text-warm-900">
                  {weekInfo.baby_weight_grams >= 1000
                    ? `${(weekInfo.baby_weight_grams / 1000).toFixed(1)} kg`
                    : `${weekInfo.baby_weight_grams} g`}
                </div>
                <div className="text-xs text-warm-500">peso estimado</div>
              </div>
            )}
          </div>
        </div>

        {/* Development info */}
        {weekInfo && (
          <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-bold text-warm-900 mb-2">🧒 Desarrollo del bebé</h3>
            <p className="text-sm text-warm-600 leading-relaxed">{weekInfo.development_summary}</p>
          </div>
        )}

        {/* Mom symptoms */}
        {weekInfo?.mom_symptoms && (
          <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-bold text-warm-900 mb-2">🤰 Cómo te podés sentir</h3>
            <p className="text-sm text-warm-600 leading-relaxed">{weekInfo.mom_symptoms}</p>
          </div>
        )}

        {/* Tip */}
        {weekInfo?.tips && (
          <div className="bg-brand-50 rounded-2xl border border-brand-100 p-5 mb-4">
            <h3 className="text-sm font-bold text-brand-700 mb-2">💡 Tip de la semana</h3>
            <p className="text-sm text-brand-600 leading-relaxed">{weekInfo.tips}</p>
          </div>
        )}

        {/* Important tests */}
        {weekInfo?.important_tests && (
          <div className="bg-blush-50 rounded-2xl border border-blush-100 p-5 mb-4">
            <h3 className="text-sm font-bold text-blush-700 mb-2">🩺 Estudios recomendados</h3>
            <p className="text-sm text-blush-600 leading-relaxed">{weekInfo.important_tests}</p>
          </div>
        )}

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-warm-900">📋 Próximos controles</h3>
            <button onClick={() => router.push('/health')} className="text-xs text-brand-500 font-semibold">
              Ver todos →
            </button>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-warm-400">No hay controles agendados</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 py-2 border-b border-warm-50 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-sm">📅</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-warm-800">{apt.title}</div>
                    <div className="text-xs text-warm-500">
                      {new Date(apt.appointment_date).toLocaleDateString('es-AR', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                      {apt.doctor_name && ` · ${apt.doctor_name}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { href: '/timeline', icon: '📅', label: 'Línea de tiempo' },
            { href: '/health', icon: '💊', label: 'Registrar salud' },
            { href: '/journal', icon: '📓', label: 'Escribir diario' },
            { href: '/reminders', icon: '⏰', label: 'Recordatorios' },
          ].map((a) => (
            <button key={a.href} onClick={() => router.push(a.href)}
              className="bg-white rounded-2xl border border-warm-100 p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-xs font-semibold text-warm-600">{a.label}</div>
            </button>
          ))}
        </div>

        {/* Baby name */}
        {pregnancy.baby_name && (
          <div className="text-center py-6 text-warm-400 text-sm">
            {pregnancy.baby_gender === 'niño' ? '💙' : pregnancy.baby_gender === 'niña' ? '💗' : '💛'}{' '}
            {pregnancy.baby_name} ya está en camino
          </div>
        )}
      </div>
    </AppLayout>
  );
}
