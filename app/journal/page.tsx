'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { calculateWeek } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import type { JournalEntry, MoodLog, SymptomLog } from '@/types';

const MOODS = [
  { value: 'feliz', emoji: '😊', label: 'Feliz' },
  { value: 'tranquila', emoji: '😌', label: 'Tranquila' },
  { value: 'emocionada', emoji: '🤩', label: 'Emocionada' },
  { value: 'agradecida', emoji: '🥰', label: 'Agradecida' },
  { value: 'energica', emoji: '💪', label: 'Enérgica' },
  { value: 'cansada', emoji: '😴', label: 'Cansada' },
  { value: 'ansiosa', emoji: '😰', label: 'Ansiosa' },
  { value: 'irritable', emoji: '😤', label: 'Irritable' },
  { value: 'preocupada', emoji: '😟', label: 'Preocupada' },
  { value: 'triste', emoji: '😢', label: 'Triste' },
];

const SYMPTOMS = [
  'Náuseas', 'Fatiga', 'Dolor de espalda', 'Acidez', 'Insomnio',
  'Hinchazón', 'Dolor de cabeza', 'Calambres', 'Mareos', 'Contracciones',
  'Dolor pélvico', 'Congestión nasal', 'Estrías', 'Ganas de orinar',
];

type Tab = 'diario' | 'animo' | 'sintomas';

export default function JournalPage() {
  const { user, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('diario');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');

  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomIntensity, setSymptomIntensity] = useState(3);
  const [symptomNote, setSymptomNote] = useState('');

  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!pregnancy) return;
    fetchAll();
  }, [pregnancy]);

  const fetchAll = async () => {
    if (!pregnancy) return;
    const [e, m, s] = await Promise.all([
      supabase.from('journal_entries').select('*').eq('pregnancy_id', pregnancy.id).order('entry_date', { ascending: false }),
      supabase.from('mood_log').select('*').eq('pregnancy_id', pregnancy.id).order('log_date', { ascending: false }).limit(14),
      supabase.from('symptoms_log').select('*').eq('pregnancy_id', pregnancy.id).order('log_date', { ascending: false }).limit(20),
    ]);
    if (e.data) setEntries(e.data);
    if (m.data) setMoods(m.data);
    if (s.data) setSymptoms(s.data);
  };

  const handleAddEntry = async () => {
    if (!pregnancy || !user || !entryContent.trim()) return;
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      title: entryTitle || null,
      content: entryContent,
      week_number: currentWeek,
    });
    setEntryTitle('');
    setEntryContent('');
    setShowAdd(false);
    fetchAll();
  };

  const handleAddMood = async () => {
    if (!pregnancy || !user || !selectedMood) return;
    await supabase.from('mood_log').insert({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      mood: selectedMood,
      energy_level: energyLevel,
      notes: moodNote || null,
      week_number: currentWeek,
    });
    setSelectedMood('');
    setMoodNote('');
    setEnergyLevel(3);
    fetchAll();
  };

  const handleAddSymptoms = async () => {
    if (!pregnancy || !user || selectedSymptoms.length === 0) return;
    const inserts = selectedSymptoms.map((s) => ({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      symptom: s.toLowerCase().replace(/ /g, '_'),
      intensity: symptomIntensity,
      notes: symptomNote || null,
      week_number: currentWeek,
    }));
    await supabase.from('symptoms_log').insert(inserts);
    setSelectedSymptoms([]);
    setSymptomNote('');
    setSymptomIntensity(3);
    fetchAll();
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  if (loading || !pregnancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">📓</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-warm-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Mi Diario
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-warm-100 rounded-xl p-1">
          {([
            { key: 'diario' as Tab, label: '📓 Diario' },
            { key: 'animo' as Tab, label: '😊 Ánimo' },
            { key: 'sintomas' as Tab, label: '🤒 Síntomas' },
          ]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ DIARY TAB ═══ */}
        {tab === 'diario' && (
          <>
            <button onClick={() => setShowAdd(true)}
              className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all mb-6">
              ✏️ Escribir en mi diario
            </button>

            {entries.length === 0 ? (
              <div className="text-center py-16 text-warm-400">
                <div className="text-3xl mb-3">📓</div>
                <p className="text-sm">Tu diario está vacío. ¡Empezá a escribir!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-2xl border border-warm-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-brand-500">Semana {entry.week_number}</span>
                      <span className="text-xs text-warm-400">
                        {new Date(entry.entry_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    {entry.title && <h3 className="font-bold text-warm-900 text-sm mb-1">{entry.title}</h3>}
                    <p className="text-sm text-warm-600 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Entry Modal */}
            {showAdd && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
                <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
                  <h3 className="text-lg font-bold text-warm-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    ✏️ Nueva entrada
                  </h3>
                  <div className="space-y-3">
                    <input type="text" value={entryTitle} onChange={(e) => setEntryTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                      placeholder="Título (opcional)" />
                    <textarea value={entryContent} onChange={(e) => setEntryContent(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none min-h-[150px] resize-none"
                      placeholder="¿Qué querés recordar de hoy?" />
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={handleAddEntry}
                      className="flex-1 py-3 bg-brand-500 text-white rounded-full font-semibold text-sm">Guardar</button>
                    <button onClick={() => setShowAdd(false)}
                      className="py-3 px-6 bg-warm-100 text-warm-600 rounded-full font-semibold text-sm">Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ MOOD TAB ═══ */}
        {tab === 'animo' && (
          <>
            <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-warm-900 mb-3">¿Cómo te sentís hoy?</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {MOODS.map((m) => (
                  <button key={m.value} onClick={() => setSelectedMood(m.value)}
                    className={`flex flex-col items-center py-3 rounded-xl transition-all text-center ${
                      selectedMood === m.value
                        ? 'bg-brand-50 border-2 border-brand-400 scale-105'
                        : 'bg-warm-50 border-2 border-transparent hover:bg-warm-100'
                    }`}>
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[9px] font-medium text-warm-500 mt-1">{m.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-warm-600 mb-2">Nivel de energía</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setEnergyLevel(n)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            n <= energyLevel ? 'bg-brand-100 text-brand-700' : 'bg-warm-100 text-warm-400'
                          }`}>
                          ⚡
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="text" value={moodNote} onChange={(e) => setMoodNote(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none mb-3"
                    placeholder="Nota rápida (opcional)" />
                  <button onClick={handleAddMood}
                    className="w-full py-3 bg-brand-500 text-white rounded-full font-semibold text-sm">
                    Guardar estado de ánimo
                  </button>
                </>
              )}
            </div>

            {/* Mood history */}
            <h3 className="text-sm font-bold text-warm-900 mb-3">Historial reciente</h3>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => {
                const config = MOODS.find((x) => x.value === m.mood);
                return (
                  <div key={m.id} className="bg-white rounded-xl border border-warm-100 px-3 py-2 flex items-center gap-2">
                    <span className="text-lg">{config?.emoji || '😐'}</span>
                    <div>
                      <div className="text-xs font-semibold text-warm-700">{config?.label}</div>
                      <div className="text-[10px] text-warm-400">
                        {new Date(m.log_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ SYMPTOMS TAB ═══ */}
        {tab === 'sintomas' && (
          <>
            <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-6 shadow-sm">
              <h3 className="text-sm font-bold text-warm-900 mb-3">¿Qué síntomas tenés hoy?</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {SYMPTOMS.map((s) => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedSymptoms.includes(s)
                        ? 'bg-blush-100 text-blush-700 border-2 border-blush-300'
                        : 'bg-warm-100 text-warm-600 border-2 border-transparent'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              {selectedSymptoms.length > 0 && (
                <>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-warm-600 mb-2">Intensidad</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setSymptomIntensity(n)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                            n <= symptomIntensity ? 'bg-blush-100 text-blush-700' : 'bg-warm-100 text-warm-400'
                          }`}>
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-warm-400 mt-1 px-1">
                      <span>Leve</span><span>Intenso</span>
                    </div>
                  </div>
                  <input type="text" value={symptomNote} onChange={(e) => setSymptomNote(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none mb-3"
                    placeholder="Nota (opcional)" />
                  <button onClick={handleAddSymptoms}
                    className="w-full py-3 bg-blush-500 text-white rounded-full font-semibold text-sm">
                    Registrar síntomas
                  </button>
                </>
              )}
            </div>

            {/* Symptoms history */}
            <h3 className="text-sm font-bold text-warm-900 mb-3">Historial reciente</h3>
            <div className="space-y-2">
              {symptoms.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-warm-100 p-3 flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-4 rounded-full ${i < s.intensity ? 'bg-blush-400' : 'bg-warm-200'}`} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-warm-800 capitalize">{s.symptom.replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-warm-400">
                      {new Date(s.log_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      {s.notes && ` · ${s.notes}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}