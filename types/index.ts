export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'mama' | 'papa' | 'otro';
  partner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PregnancyProfile {
  id: string;
  user_id: string;
  baby_name: string | null;
  baby_gender: 'niño' | 'niña' | 'sorpresa' | null;
  due_date: string;
  last_period_date: string | null;
  pregnancy_type: 'único' | 'mellizos' | 'trillizos';
  doctor_name: string | null;
  doctor_phone: string | null;
  clinic_name: string | null;
  blood_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyInfo {
  week_number: number;
  trimester: number;
  fruit_comparison: string;
  fruit_emoji: string;
  baby_size_cm: number | null;
  baby_weight_grams: number | null;
  development_summary: string;
  mom_symptoms: string | null;
  tips: string | null;
  important_tests: string | null;
}

export interface HealthRecord {
  id: string;
  user_id: string;
  pregnancy_id: string;
  record_date: string;
  record_type: 'peso' | 'presion_sistolica' | 'presion_diastolica' | 'glucemia' | 'temperatura' | 'altura_uterina' | 'otro';
  value: number;
  unit: string;
  notes: string | null;
  week_number: number | null;
  created_at: string;
}

export interface MedicalAppointment {
  id: string;
  user_id: string;
  pregnancy_id: string;
  title: string;
  appointment_date: string;
  doctor_name: string | null;
  specialty: string | null;
  location: string | null;
  notes: string | null;
  is_completed: boolean;
  week_number: number | null;
  created_at: string;
}

export interface Ultrasound {
  id: string;
  user_id: string;
  pregnancy_id: string;
  ultrasound_date: string;
  week_number: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  doctor_notes: string | null;
  ai_summary: string | null;
  baby_weight_grams: number | null;
  baby_length_cm: number | null;
  created_at: string;
}

export interface LabResult {
  id: string;
  user_id: string;
  pregnancy_id: string;
  result_date: string;
  study_type: string;
  file_url: string | null;
  notes: string | null;
  ai_summary: string | null;
  week_number: number | null;
  created_at: string;
}

export interface SymptomLog {
  id: string;
  user_id: string;
  pregnancy_id: string;
  log_date: string;
  symptom: string;
  intensity: number;
  notes: string | null;
  week_number: number | null;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  pregnancy_id: string;
  log_date: string;
  mood: string;
  energy_level: number | null;
  notes: string | null;
  week_number: number | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  pregnancy_id: string;
  entry_date: string;
  week_number: number | null;
  title: string | null;
  content: string;
  photo_urls: string[] | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  pregnancy_id: string;
  title: string;
  reminder_type: 'control' | 'vitamina' | 'estudio' | 'vacuna' | 'otro';
  reminder_datetime: string;
  recurrence: 'diario' | 'semanal' | 'mensual' | 'unico';
  is_active: boolean;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface KickSession {
  id: string;
  user_id: string;
  pregnancy_id: string;
  session_start: string;
  session_end: string | null;
  kick_count: number;
  week_number: number | null;
  notes: string | null;
  created_at: string;
}

export interface BabyName {
  id: string;
  user_id: string;
  name: string;
  gender: 'niño' | 'niña' | 'unisex' | null;
  origin: string | null;
  meaning: string | null;
  rating: number | null;
  is_favorite: boolean;
  partner_approved: boolean | null;
  created_at: string;
}

export interface BirthChecklistItem {
  id: string;
  user_id: string;
  pregnancy_id: string;
  category: string;
  item: string;
  is_completed: boolean;
  priority: 'alta' | 'media' | 'baja';
  due_week: number | null;
  notes: string | null;
  created_at: string;
}
