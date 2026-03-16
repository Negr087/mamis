'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWeeklyInfo } from '@/hooks/useWeeklyInfo';
import { calculateWeek, getTrimester } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';

export default function TimelinePage() {
  const { user, pregnancy, loading } = useAuth();
  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;
  const { allWeeks, loading: weeksLoading } = useWeeklyInfo(currentWeek);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    // Auto scroll to current week
    if (currentWeek) {
      const el = document.getElementById(`week-${currentWeek}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWeek, weeksLoading]);

  if (loading || weeksLoading || !pregnancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">📅</div>
        </div>
      </AppLayout>
    );
  }

  const trimesterColors: Record<number, string> = {
    1: 'border-l-brand-400',
    2: 'border-l-blush-400',
    3: 'border-l-warm-500',
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold text-warm-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Línea de tiempo
        </h1>
        <p className="text-warm-500 text-sm mb-8">Seguí semana a semana el crecimiento de tu bebé</p>

        {/* Trimester legend */}
        <div className="flex gap-4 mb-6">
          {[
            { t: 1, label: '1er trimestre', color: 'bg-brand-400' },
            { t: 2, label: '2do trimestre', color: 'bg-blush-400' },
            { t: 3, label: '3er trimestre', color: 'bg-warm-500' },
          ].map(({ t, label, color }) => (
            <div key={t} className="flex items-center gap-2 text-xs text-warm-500">
              <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
              {label}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {allWeeks.map((week) => {
            const isCurrent = week.week_number === currentWeek;
            const isPast = currentWeek ? week.week_number < currentWeek : false;
            const isFuture = currentWeek ? week.week_number > currentWeek : false;

            return (
              <div
                key={week.week_number}
                id={`week-${week.week_number}`}
                className={cn(
                  'border-l-4 rounded-xl p-4 transition-all',
                  trimesterColors[week.trimester],
                  isCurrent
                    ? 'bg-white shadow-lg shadow-brand-500/10 border border-brand-200 scale-[1.02]'
                    : isPast
                    ? 'bg-white border border-warm-100 opacity-70'
                    : 'bg-warm-50 border border-warm-100 opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'text-2xl transition-all',
                    isCurrent ? 'scale-110' : '',
                    isFuture ? 'grayscale' : ''
                  )}>
                    {week.fruit_emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-bold',
                        isCurrent ? 'text-brand-600' : 'text-warm-700'
                      )}>
                        Semana {week.week_number}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full">
                          AHORA
                        </span>
                      )}
                      {isPast && (
                        <span className="text-warm-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-warm-500 mt-0.5">{week.fruit_comparison}</p>
                    {(isCurrent || isPast) && (
                      <p className="text-xs text-warm-600 mt-2 leading-relaxed">
                        {week.development_summary}
                      </p>
                    )}
                    {week.important_tests && (isCurrent || isPast) && (
                      <div className="mt-2 text-xs text-blush-600 bg-blush-50 rounded-lg px-3 py-1.5 inline-block">
                        🩺 {week.important_tests}
                      </div>
                    )}
                  </div>
                  {week.baby_size_cm && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-warm-600">{week.baby_size_cm} cm</div>
                      {week.baby_weight_grams && week.baby_weight_grams > 0 && (
                        <div className="text-[10px] text-warm-400">
                          {week.baby_weight_grams >= 1000
                            ? `${(week.baby_weight_grams / 1000).toFixed(1)} kg`
                            : `${week.baby_weight_grams} g`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
