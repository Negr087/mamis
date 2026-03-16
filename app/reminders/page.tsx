'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { calculateWeek } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import type { Reminder } from '@/types';

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  control: { emoji: '🩺', label: 'Control médico', color: 'bg-brand-50 text-brand-700' },
  vitamina: { emoji: '💊', label: 'Vitamina', color: 'bg-green-50 text-green-700' },
  estudio: { emoji: '🔬', label: 'Estudio', color: 'bg-blue-50 text-blue-700' },
  vacuna: { emoji: '💉', label: 'Vacuna', color: 'bg-purple-50 text-purple-700' },
  otro: { emoji: '📌', label: 'Otro', color: 'bg-warm-100 text-warm-700' },
};

export default function RemindersPage() {
  const { user, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('control');
  const [datetime, setDatetime] = useState('');
  const [recurrence, setRecurrence] = useState('unico');
  const [notes, setNotes] = useState('');

  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (pregnancy) fetchReminders();
  }, [pregnancy]);

  const fetchReminders = async () => {
    if (!pregnancy) return;
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('pregnancy_id', pregnancy.id)
      .order('reminder_datetime', { ascending: true });
    if (data) setReminders(data);
  };

  const handleAdd = async () => {
    if (!pregnancy || !user || !title || !datetime) return;
    await supabase.from('reminders').insert({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      title,
      reminder_type: type,
      reminder_datetime: datetime,
      recurrence,
      notes: notes || null,
    });
    setTitle('');
    setDatetime('');
    setNotes('');
    setShowAdd(false);
    fetchReminders();
  };

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from('reminders').update({ is_completed: !current }).eq('id', id);
    fetchReminders();
  };

  const deleteReminder = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
    fetchReminders();
  };

  const filtered = reminders.filter((r) =>
    filter === 'pending' ? !r.is_completed : r.is_completed
  );

  if (loading || !pregnancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">⏰</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-warm-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Recordatorios
        </h1>

        <div className="flex gap-2 mb-6 bg-warm-100 rounded-xl p-1">
          <button onClick={() => setFilter('pending')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'pending' ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
            }`}>
            ⏳ Pendientes ({reminders.filter(r => !r.is_completed).length})
          </button>
          <button onClick={() => setFilter('completed')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              filter === 'completed' ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
            }`}>
            ✅ Completados ({reminders.filter(r => r.is_completed).length})
          </button>
        </div>

        <button onClick={() => setShowAdd(true)}
          className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all mb-6">
          + Nuevo recordatorio
        </button>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-warm-400">
            <div className="text-3xl mb-3">{filter === 'pending' ? '🎉' : '📭'}</div>
            <p className="text-sm">
              {filter === 'pending' ? '¡No hay recordatorios pendientes!' : 'No hay completados aún'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((rem) => {
              const config = TYPE_CONFIG[rem.reminder_type] || TYPE_CONFIG.otro;
              const isPast = new Date(rem.reminder_datetime) < new Date();
              return (
                <div key={rem.id}
                  className={`bg-white rounded-2xl border border-warm-100 p-4 shadow-sm transition-all ${
                    rem.is_completed ? 'opacity-60' : isPast && !rem.is_completed ? 'border-blush-200 bg-blush-50/30' : ''
                  }`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleComplete(rem.id, rem.is_completed)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        rem.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-warm-300 hover:border-brand-400'
                      }`}>
                      {rem.is_completed && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-bold ${rem.is_completed ? 'line-through text-warm-400' : 'text-warm-900'}`}>
                          {rem.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.emoji} {config.label}
                        </span>
                      </div>
                      <div className="text-xs text-warm-500">
                        📅 {new Date(rem.reminder_datetime).toLocaleDateString('es-AR', {
                          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                        {rem.recurrence !== 'unico' && ` · 🔄 ${rem.recurrence}`}
                      </div>
                      {rem.notes && <div className="text-xs text-warm-400 mt-1 italic">{rem.notes}</div>}
                    </div>
                    <button onClick={() => deleteReminder(rem.id)}
                      className="text-warm-300 hover:text-red-400 transition-colors text-sm p-1">
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-warm-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Nuevo recordatorio
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Título</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                    placeholder="Ej: Tomar ácido fólico" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none">
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.emoji} {v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Repetir</label>
                    <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none">
                      <option value="unico">Una vez</option>
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Fecha y hora</label>
                  <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Notas (opcional)</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                    placeholder="Detalle adicional..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAdd}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-full font-semibold text-sm">Guardar</button>
                <button onClick={() => setShowAdd(false)}
                  className="py-3 px-6 bg-warm-100 text-warm-600 rounded-full font-semibold text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}