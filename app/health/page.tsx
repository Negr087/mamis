'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { calculateWeek } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';
import type { HealthRecord, MedicalAppointment } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Tab = 'registros' | 'consultas';
type RecordType = 'peso' | 'presion_sistolica' | 'presion_diastolica' | 'glucemia' | 'temperatura';

const RECORD_CONFIG: Record<RecordType, { label: string; unit: string; emoji: string; color: string }> = {
  peso: { label: 'Peso', unit: 'kg', emoji: '⚖️', color: '#d77d34' },
  presion_sistolica: { label: 'Presión sistólica', unit: 'mmHg', emoji: '❤️', color: '#e6938b' },
  presion_diastolica: { label: 'Presión diastólica', unit: 'mmHg', emoji: '💜', color: '#ab47bc' },
  glucemia: { label: 'Glucemia', unit: 'mg/dl', emoji: '🩸', color: '#42a5f5' },
  temperatura: { label: 'Temperatura', unit: '°C', emoji: '🌡️', color: '#ffa726' },
};

export default function HealthPage() {
  const { user, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('registros');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [chartType, setChartType] = useState<RecordType>('peso');

  // Form states
  const [formType, setFormType] = useState<RecordType>('peso');
  const [formValue, setFormValue] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  const [aptTitle, setAptTitle] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptDoctor, setAptDoctor] = useState('');
  const [aptLocation, setAptLocation] = useState('');
  const [aptNotes, setAptNotes] = useState('');

  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (!pregnancy) return;
    fetchRecords();
    fetchAppointments();
  }, [pregnancy]);

  const fetchRecords = async () => {
    if (!pregnancy) return;
    const { data } = await supabase
      .from('health_records')
      .select('*')
      .eq('pregnancy_id', pregnancy.id)
      .order('record_date', { ascending: true });
    if (data) setRecords(data);
  };

  const fetchAppointments = async () => {
    if (!pregnancy) return;
    const { data } = await supabase
      .from('medical_appointments')
      .select('*')
      .eq('pregnancy_id', pregnancy.id)
      .order('appointment_date', { ascending: false });
    if (data) setAppointments(data);
  };

  const handleAddRecord = async () => {
    if (!pregnancy || !formValue || !user) return;
    const config = RECORD_CONFIG[formType];
    await supabase.from('health_records').insert({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      record_date: formDate,
      record_type: formType,
      value: parseFloat(formValue),
      unit: config.unit,
      notes: formNotes || null,
      week_number: currentWeek,
    });
    setFormValue('');
    setFormNotes('');
    setShowAddRecord(false);
    fetchRecords();
  };

  const handleAddAppointment = async () => {
    if (!pregnancy || !aptTitle || !aptDate || !user) return;
    await supabase.from('medical_appointments').insert({
      user_id: user.id,
      pregnancy_id: pregnancy.id,
      title: aptTitle,
      appointment_date: aptDate,
      doctor_name: aptDoctor || null,
      location: aptLocation || null,
      notes: aptNotes || null,
      week_number: currentWeek,
    });
    setAptTitle('');
    setAptDate('');
    setAptDoctor('');
    setAptLocation('');
    setAptNotes('');
    setShowAddAppointment(false);
    fetchAppointments();
  };

  const toggleAppointmentComplete = async (id: string, current: boolean) => {
    await supabase.from('medical_appointments').update({ is_completed: !current }).eq('id', id);
    fetchAppointments();
  };

  const chartData = records
    .filter((r) => r.record_type === chartType)
    .map((r) => ({
      fecha: new Date(r.record_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
      valor: r.value,
    }));

  const latestByType = (type: RecordType) => {
    const filtered = records.filter((r) => r.record_type === type);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  };

  if (loading || !pregnancy) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">💊</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-5 py-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-warm-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Salud
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-warm-100 rounded-xl p-1">
          {(['registros', 'consultas'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
              }`}>
              {t === 'registros' ? '📊 Registros' : '📋 Consultas'}
            </button>
          ))}
        </div>

        {tab === 'registros' && (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(Object.keys(RECORD_CONFIG) as RecordType[]).slice(0, 4).map((type) => {
                const config = RECORD_CONFIG[type];
                const latest = latestByType(type);
                return (
                  <div key={type} className="bg-white rounded-2xl border border-warm-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{config.emoji}</span>
                      <span className="text-xs font-semibold text-warm-500">{config.label}</span>
                    </div>
                    {latest ? (
                      <div className="text-xl font-bold text-warm-900">
                        {latest.value} <span className="text-xs font-normal text-warm-400">{config.unit}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-warm-400">Sin datos</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-warm-900">📈 Evolución</h3>
                <select value={chartType} onChange={(e) => setChartType(e.target.value as RecordType)}
                  className="text-xs bg-warm-50 border border-warm-200 rounded-lg px-3 py-1.5 text-warm-700 outline-none">
                  {(Object.keys(RECORD_CONFIG) as RecordType[]).map((type) => (
                    <option key={type} value={type}>{RECORD_CONFIG[type].label}</option>
                  ))}
                </select>
              </div>
              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#9e948a' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#9e948a' }} width={40} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e8e0d4', fontSize: 12 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Line type="monotone" dataKey="valor" stroke={RECORD_CONFIG[chartType].color}
                      strokeWidth={2.5} dot={{ r: 4, fill: RECORD_CONFIG[chartType].color }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10 text-warm-400 text-sm">
                  Necesitás al menos 2 registros para ver el gráfico
                </div>
              )}
            </div>

            {/* Add record button */}
            <button onClick={() => setShowAddRecord(true)}
              className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all mb-6">
              + Agregar registro
            </button>

            {/* Recent records */}
            <div className="space-y-2">
              {[...records].reverse().slice(0, 10).map((r) => {
                const config = RECORD_CONFIG[r.record_type as RecordType] || { label: r.record_type, emoji: '📝', unit: '' };
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-warm-100 p-3 flex items-center gap-3">
                    <span className="text-lg">{config.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-warm-800">{config.label}</div>
                      <div className="text-xs text-warm-500">
                        {new Date(r.record_date).toLocaleDateString('es-AR')}
                        {r.notes && ` · ${r.notes}`}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-warm-900">{r.value} {config.unit}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'consultas' && (
          <>
            <button onClick={() => setShowAddAppointment(true)}
              className="w-full py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all mb-6">
              + Agendar consulta
            </button>

            {appointments.length === 0 ? (
              <div className="text-center py-16 text-warm-400">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm">No hay consultas agendadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id}
                    className={`bg-white rounded-xl border border-warm-100 p-4 transition-all ${apt.is_completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleAppointmentComplete(apt.id, apt.is_completed)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                          apt.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-warm-300'
                        }`}>
                        {apt.is_completed && '✓'}
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${apt.is_completed ? 'line-through text-warm-500' : 'text-warm-900'}`}>
                          {apt.title}
                        </div>
                        <div className="text-xs text-warm-500 mt-1">
                          📅 {new Date(apt.appointment_date).toLocaleDateString('es-AR', {
                            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        {apt.doctor_name && <div className="text-xs text-warm-500 mt-0.5">👩‍⚕️ {apt.doctor_name}</div>}
                        {apt.location && <div className="text-xs text-warm-500 mt-0.5">📍 {apt.location}</div>}
                        {apt.notes && <div className="text-xs text-warm-400 mt-1 italic">{apt.notes}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddRecord(false)} />
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-warm-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Nuevo registro
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Tipo</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value as RecordType)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none">
                    {(Object.keys(RECORD_CONFIG) as RecordType[]).map((type) => (
                      <option key={type} value={type}>{RECORD_CONFIG[type].emoji} {RECORD_CONFIG[type].label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Valor</label>
                    <input type="number" step="0.1" value={formValue} onChange={(e) => setFormValue(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                      placeholder={RECORD_CONFIG[formType].unit} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Fecha</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Notas (opcional)</label>
                  <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                    placeholder="Alguna observación..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddRecord}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600">
                  Guardar
                </button>
                <button onClick={() => setShowAddRecord(false)}
                  className="py-3 px-6 bg-warm-100 text-warm-600 rounded-full font-semibold text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Appointment Modal */}
        {showAddAppointment && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddAppointment(false)} />
            <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-warm-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Nueva consulta
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Título</label>
                  <input type="text" value={aptTitle} onChange={(e) => setAptTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                    placeholder="Ej: Control mensual" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Fecha y hora</label>
                  <input type="datetime-local" value={aptDate} onChange={(e) => setAptDate(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Doctor</label>
                    <input type="text" value={aptDoctor} onChange={(e) => setAptDoctor(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                      placeholder="Dr./Dra." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Lugar</label>
                    <input type="text" value={aptLocation} onChange={(e) => setAptLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                      placeholder="Clínica..." />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-600 mb-1 uppercase tracking-wide">Notas</label>
                  <input type="text" value={aptNotes} onChange={(e) => setAptNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none"
                    placeholder="Llevar estudios previos..." />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleAddAppointment}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600">
                  Agendar
                </button>
                <button onClick={() => setShowAddAppointment(false)}
                  className="py-3 px-6 bg-warm-100 text-warm-600 rounded-full font-semibold text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}