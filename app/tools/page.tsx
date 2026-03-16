'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { calculateWeek } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import type { BabyName, BirthChecklistItem, KickSession } from '@/types';

type Tool = 'assistant' | 'names' | 'kicks' | 'checklist' | 'analyzer';

export default function ToolsPage() {
  const { user, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<Tool>('assistant');
  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  if (loading || !pregnancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">🧰</div>
        </div>
      </AppLayout>
    );
  }

  const tools = [
    { key: 'assistant' as Tool, emoji: '🤖', label: 'Asistente IA' },
    { key: 'names' as Tool, emoji: '👶', label: 'Nombres' },
    { key: 'kicks' as Tool, emoji: '🦶', label: 'Pataditas' },
    { key: 'checklist' as Tool, emoji: '✅', label: 'Checklist' },
    { key: 'analyzer' as Tool, emoji: '🔬', label: 'Análisis IA' },
  ];

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-warm-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Herramientas
        </h1>

        {/* Tool selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {tools.map((t) => (
            <button key={t.key} onClick={() => setActiveTool(t.key)}
              className={`flex flex-col items-center min-w-[72px] py-3 px-3 rounded-2xl text-center transition-all ${
                activeTool === t.key
                  ? 'bg-brand-50 border-2 border-brand-400 shadow-sm'
                  : 'bg-white border-2 border-warm-100'
              }`}>
              <span className="text-xl">{t.emoji}</span>
              <span className="text-[10px] font-semibold text-warm-600 mt-1">{t.label}</span>
            </button>
          ))}
        </div>

        {activeTool === 'assistant' && <AssistantTool weekNumber={currentWeek} />}
        {activeTool === 'names' && <NamesTool userId={user!.id} />}
        {activeTool === 'kicks' && <KicksTool userId={user!.id} pregnancyId={pregnancy.id} weekNumber={currentWeek} supabase={supabase} />}
        {activeTool === 'checklist' && <ChecklistTool userId={user!.id} pregnancyId={pregnancy.id} weekNumber={currentWeek} supabase={supabase} />}
        {activeTool === 'analyzer' && <AnalyzerTool weekNumber={currentWeek} />}
      </div>
    </AppLayout>
  );
}

/* ═══════════════════════════════════════
   AI ASSISTANT
   ═══════════════════════════════════════ */
function AssistantTool({ weekNumber }: { weekNumber: number | null }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `¡Hola! 👋 Soy Bumpy, tu asistente de embarazo. Estás en la semana ${weekNumber || '?'}. ¿En qué puedo ayudarte?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, weekNumber }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer || 'No pude responder. Intentá de nuevo.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: '❌ Error de conexión. Intentá de nuevo.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden shadow-sm">
      <div className="h-[400px] overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-500 text-white rounded-br-md'
                : 'bg-warm-100 text-warm-800 rounded-bl-md'
            }`}>
              <span className="whitespace-pre-wrap">{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-warm-100 rounded-2xl px-4 py-3 text-sm text-warm-500 animate-pulse">
              Pensando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-warm-100 p-3 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-full text-sm outline-none"
          placeholder="Preguntale algo a Bumpy..." />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm disabled:opacity-50">
          ➤
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BABY NAME GENERATOR
   ═══════════════════════════════════════ */
function NamesTool({ userId }: { userId: string }) {
  const [gender, setGender] = useState('cualquiera');
  const [origin, setOrigin] = useState('');
  const [surname, setSurname] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, origin, surname }),
      });
      const data = await res.json();
      setResults(data.names || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const toggleFav = (name: string) => {
    setFavorites((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-bold text-warm-900 mb-4">👶 Generador de nombres</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5">Género</label>
            <div className="flex gap-2">
              {[
                { v: 'cualquiera', l: '🌈 Todos' },
                { v: 'niño', l: '💙 Niño' },
                { v: 'niña', l: '💗 Niña' },
              ].map((g) => (
                <button key={g.v} onClick={() => setGender(g.v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    gender === g.v ? 'bg-brand-50 border-2 border-brand-400' : 'bg-warm-50 border-2 border-transparent'
                  }`}>{g.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5">Estilo / Origen (opcional)</label>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
              placeholder="Ej: latino, nórdico, corto, clásico..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-warm-600 mb-1.5">Apellido (para sonoridad)</label>
            <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)}
              className="w-full px-4 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
              placeholder="Tu apellido" />
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full py-3 bg-brand-500 text-white rounded-full font-semibold text-sm disabled:opacity-50">
            {loading ? '✨ Generando...' : '✨ Generar nombres'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((name: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-warm-100 p-4 flex items-center gap-3 shadow-sm">
              <button onClick={() => toggleFav(name.name)}
                className={`text-xl transition-transform ${favorites.includes(name.name) ? 'scale-110' : 'grayscale opacity-40'}`}>
                ❤️
              </button>
              <div className="flex-1">
                <div className="text-sm font-bold text-warm-900">{name.name}</div>
                <div className="text-xs text-warm-500">
                  {name.gender === 'niño' ? '💙' : name.gender === 'niña' ? '💗' : '🌈'} {name.origin}
                </div>
                <div className="text-xs text-warm-400 mt-0.5">{name.meaning}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   KICK COUNTER
   ═══════════════════════════════════════ */
function KicksTool({ userId, pregnancyId, weekNumber, supabase }: any) {
  const [counting, setCounting] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    fetchSessions();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (counting && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [counting, startTime]);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('kick_sessions')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('session_start', { ascending: false })
      .limit(10);
    if (data) setSessions(data);
  };

  const startSession = () => {
    setCounting(true);
    setKicks(0);
    setElapsed(0);
    setStartTime(new Date());
  };

  const addKick = () => {
    if (counting) setKicks((k) => k + 1);
  };

  const endSession = async () => {
    setCounting(false);
    clearInterval(intervalRef.current);
    if (kicks > 0 && startTime) {
      await supabase.from('kick_sessions').insert({
        user_id: userId,
        pregnancy_id: pregnancyId,
        session_start: startTime.toISOString(),
        session_end: new Date().toISOString(),
        kick_count: kicks,
        week_number: weekNumber,
      });
      fetchSessions();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-4 shadow-sm text-center">
        <h3 className="text-sm font-bold text-warm-900 mb-2">🦶 Contador de pataditas</h3>
        <p className="text-xs text-warm-500 mb-6">Contá los movimientos de tu bebé</p>

        <div className="mb-6">
          <div className="text-5xl font-bold text-brand-600 mb-1">{kicks}</div>
          <div className="text-xs text-warm-500">pataditas</div>
          {counting && (
            <div className="text-lg font-mono text-warm-600 mt-2">{formatTime(elapsed)}</div>
          )}
        </div>

        {!counting ? (
          <button onClick={startSession}
            className="w-full py-4 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all">
            ▶️ Iniciar sesión
          </button>
        ) : (
          <div className="space-y-3">
            <button onClick={addKick}
              className="w-full py-8 bg-brand-50 border-2 border-brand-300 rounded-3xl text-3xl active:scale-95 active:bg-brand-100 transition-all">
              🦶
            </button>
            <button onClick={endSession}
              className="w-full py-3 bg-warm-200 text-warm-700 rounded-full font-semibold text-sm">
              ⏹ Terminar sesión
            </button>
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-warm-900 mb-3">Sesiones anteriores</h3>
          <div className="space-y-2">
            {sessions.map((s) => {
              const dur = s.session_end
                ? Math.floor((new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 1000)
                : 0;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-warm-100 p-3 flex items-center gap-3">
                  <div className="text-lg">🦶</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-warm-800">{s.kick_count} pataditas</div>
                    <div className="text-xs text-warm-500">
                      {new Date(s.session_start).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      {' · '}{formatTime(dur)}
                      {s.week_number && ` · Sem ${s.week_number}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   BIRTH CHECKLIST
   ═══════════════════════════════════════ */
function ChecklistTool({ userId, pregnancyId, weekNumber, supabase }: any) {
  const [items, setItems] = useState<BirthChecklistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const CATEGORIES: Record<string, { label: string; emoji: string }> = {
    bolso_mama: { label: 'Bolso de mamá', emoji: '👜' },
    bolso_bebe: { label: 'Bolso del bebé', emoji: '🍼' },
    habitacion: { label: 'Habitación', emoji: '🛏️' },
    documentos: { label: 'Documentos', emoji: '📄' },
    otro: { label: 'Otros', emoji: '📦' },
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('birth_checklist')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('created_at');

    if (data && data.length > 0) {
      setItems(data);
    } else {
      // Load defaults
      const { data: defaults } = await supabase
        .from('default_checklist_items')
        .select('*')
        .order('id');

      if (defaults && defaults.length > 0) {
        const inserts = defaults.map((d: any) => ({
          user_id: userId,
          pregnancy_id: pregnancyId,
          category: d.category,
          item: d.item,
          priority: d.priority,
          due_week: d.due_week,
        }));
        await supabase.from('birth_checklist').insert(inserts);
        fetchItems();
        return;
      }
    }
    setLoaded(true);
  };

  const toggleItem = async (id: string, current: boolean) => {
    await supabase.from('birth_checklist').update({ is_completed: !current }).eq('id', id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_completed: !current } : i));
  };

  const completedCount = items.filter((i) => i.is_completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const grouped = Object.keys(CATEGORIES).reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, BirthChecklistItem[]>);

  return (
    <div>
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-warm-900">✅ Preparación para el nacimiento</h3>
          <span className="text-xs font-semibold text-brand-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-warm-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="text-xs text-warm-500 mt-2">{completedCount} de {items.length} items completados</div>
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([cat, catItems]) => {
        if (catItems.length === 0) return null;
        const config = CATEGORIES[cat];
        return (
          <div key={cat} className="mb-4">
            <h4 className="text-xs font-bold text-warm-700 mb-2 flex items-center gap-2">
              <span>{config.emoji}</span> {config.label}
            </h4>
            <div className="space-y-1.5">
              {catItems.map((item) => (
                <div key={item.id}
                  className={`bg-white rounded-xl border border-warm-100 p-3 flex items-center gap-3 transition-all ${
                    item.is_completed ? 'opacity-60' : ''
                  }`}>
                  <button onClick={() => toggleItem(item.id, item.is_completed)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                      item.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-warm-300'
                    }`}>
                    {item.is_completed && '✓'}
                  </button>
                  <span className={`text-sm flex-1 ${item.is_completed ? 'line-through text-warm-400' : 'text-warm-800'}`}>
                    {item.item}
                  </span>
                  {item.priority === 'alta' && !item.is_completed && (
                    <span className="text-[10px] bg-blush-50 text-blush-600 px-2 py-0.5 rounded-full font-semibold">
                      Importante
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   AI LAB ANALYZER
   ═══════════════════════════════════════ */
function AnalyzerTool({ weekNumber }: { weekNumber: number | null }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, weekNumber }),
      });
      const data = await res.json();
      setResult(data.summary || 'No se pudo analizar.');
    } catch {
      setResult('❌ Error de conexión.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-bold text-warm-900 mb-2">🔬 Explicador de análisis clínicos</h3>
        <p className="text-xs text-warm-500 mb-4">
          Escribí o pegá los resultados de tu análisis y la IA te los explica en lenguaje simple.
        </p>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none min-h-[140px] resize-none mb-3"
          placeholder="Ej: Hemoglobina: 11.5 g/dL, Glucemia: 85 mg/dL, Plaquetas: 250.000/mm³..." />
        <button onClick={analyze} disabled={loading || !text.trim()}
          className="w-full py-3 bg-brand-500 text-white rounded-full font-semibold text-sm disabled:opacity-50">
          {loading ? '🔍 Analizando...' : '🔍 Analizar con IA'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-warm-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-warm-900 mb-3">📋 Resultado del análisis</h3>
          <div className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
}