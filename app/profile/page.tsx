'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { calculateWeek, progressPercent, daysRemaining, getTrimester } from '@/lib/utils';
import AppLayout from '@/components/layout/AppLayout';

export default function ProfilePage() {
  const { user, profile, pregnancy, loading, supabase } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [bloodType, setBloodType] = useState('');

  const currentWeek = pregnancy ? calculateWeek(pregnancy.due_date) : null;

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (pregnancy) {
      setBabyName(pregnancy.baby_name || '');
      setDoctorName(pregnancy.doctor_name || '');
      setClinicName(pregnancy.clinic_name || '');
      setBloodType(pregnancy.blood_type || '');
    }
  }, [pregnancy]);

  const handleSave = async () => {
    if (!pregnancy) return;
    await supabase.from('pregnancy_profile').update({
      baby_name: babyName || null,
      doctor_name: doctorName || null,
      clinic_name: clinicName || null,
      blood_type: bloodType || null,
    }).eq('id', pregnancy.id);
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !pregnancy || !currentWeek) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse-soft">👤</div>
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
        <h1 className="text-2xl font-bold text-warm-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Mi Perfil
        </h1>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-4 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto mb-3">
            {profile?.role === 'papa' ? '👨' : '🤰'}
          </div>
          <h2 className="text-lg font-bold text-warm-900">{profile?.full_name}</h2>
          <p className="text-sm text-warm-500">{user?.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-semibold">
            {profile?.role === 'papa' ? '👨 Modo Papá' : '🤰 Modo Mamá'}
          </div>
        </div>

        {/* Pregnancy summary */}
        <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
          <h3 className="text-sm font-bold text-warm-900 mb-4">🤰 Mi embarazo</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-warm-500">Semana actual</span>
              <span className="text-sm font-bold text-brand-600">Semana {currentWeek} de 40</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-warm-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-warm-400">
              <span>Trimestre {trimester}</span>
              <span>{progress}% completado</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-warm-100">
              <div>
                <div className="text-xs text-warm-500">Fecha probable de parto</div>
                <div className="text-sm font-semibold text-warm-900">
                  {new Date(pregnancy.due_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div className="text-xs text-warm-500">Días restantes</div>
                <div className="text-sm font-semibold text-warm-900">{days} días</div>
              </div>
            </div>

            {pregnancy.baby_gender && pregnancy.baby_gender !== 'sorpresa' && (
              <div className="flex justify-between items-center pt-3 border-t border-warm-100">
                <span className="text-xs text-warm-500">Sexo del bebé</span>
                <span className="text-sm font-semibold">
                  {pregnancy.baby_gender === 'niño' ? '💙 Niño' : '💗 Niña'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-warm-100">
              <span className="text-xs text-warm-500">Tipo de embarazo</span>
              <span className="text-sm font-semibold text-warm-900 capitalize">{pregnancy.pregnancy_type}</span>
            </div>
          </div>
        </div>

        {/* Editable medical info */}
        <div className="bg-white rounded-2xl border border-warm-100 p-5 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-warm-900">🏥 Información médica</h3>
            <button onClick={() => editing ? handleSave() : setEditing(true)}
              className="text-xs font-semibold text-brand-500">
              {editing ? '💾 Guardar' : '✏️ Editar'}
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Nombre del bebé', value: babyName, setter: setBabyName, placeholder: 'Sin definir aún' },
              { label: 'Obstetra', value: doctorName, setter: setDoctorName, placeholder: 'Dr./Dra.' },
              { label: 'Clínica / Sanatorio', value: clinicName, setter: setClinicName, placeholder: 'Nombre del lugar' },
              { label: 'Grupo sanguíneo', value: bloodType, setter: setBloodType, placeholder: 'Ej: A+' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs text-warm-500 mb-1">{field.label}</label>
                {editing ? (
                  <input type="text" value={field.value} onChange={(e) => field.setter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm outline-none focus:border-brand-400"
                    placeholder={field.placeholder} />
                ) : (
                  <div className="text-sm font-medium text-warm-800">
                    {field.value || <span className="text-warm-400 italic">{field.placeholder}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-8 pt-6 border-t border-warm-200">
          <button onClick={handleLogout}
            className="w-full py-3 bg-warm-100 text-warm-600 rounded-full font-semibold text-sm hover:bg-warm-200 transition-all">
            Cerrar sesión
          </button>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6">
          Bumpy v0.1.0 · Hecho con 💛
        </p>
      </div>
    </AppLayout>
  );
}