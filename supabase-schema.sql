-- ============================================
-- BUMPY - Schema completo para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- TABLA: profiles
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('mama', 'papa', 'otro')) default 'mama',
  partner_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TABLA: pregnancy_profile
-- ============================================
create table if not exists public.pregnancy_profile (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  baby_name text,
  baby_gender text check (baby_gender in ('niño', 'niña', 'sorpresa')),
  due_date date not null,
  last_period_date date,
  pregnancy_type text check (pregnancy_type in ('único', 'mellizos', 'trillizos')) default 'único',
  doctor_name text,
  doctor_phone text,
  clinic_name text,
  blood_type text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pregnancy_profile enable row level security;

create policy "Users can manage their own pregnancy profile"
  on public.pregnancy_profile for all
  using (auth.uid() = user_id);

-- ============================================
-- TABLA: health_records
-- ============================================
create table if not exists public.health_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  record_date date not null,
  record_type text check (record_type in ('peso', 'presion_sistolica', 'presion_diastolica', 'glucemia', 'temperatura', 'altura_uterina', 'otro')) not null,
  value numeric not null,
  unit text not null,
  notes text,
  week_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.health_records enable row level security;
create policy "Users can manage their own health records"
  on public.health_records for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: medical_appointments
-- ============================================
create table if not exists public.medical_appointments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  title text not null,
  appointment_date timestamp with time zone not null,
  doctor_name text,
  specialty text,
  location text,
  notes text,
  is_completed boolean default false,
  week_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medical_appointments enable row level security;
create policy "Users can manage their own appointments"
  on public.medical_appointments for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: ultrasound
-- ============================================
create table if not exists public.ultrasound (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  ultrasound_date date not null,
  week_number integer,
  image_url text,
  thumbnail_url text,
  doctor_notes text,
  ai_summary text,
  baby_weight_grams numeric,
  baby_length_cm numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ultrasound enable row level security;
create policy "Users can manage their own ultrasounds"
  on public.ultrasound for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: lab_results
-- ============================================
create table if not exists public.lab_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  result_date date not null,
  study_type text not null,
  file_url text,
  notes text,
  ai_summary text,
  week_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lab_results enable row level security;
create policy "Users can manage their own lab results"
  on public.lab_results for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: symptom_log
-- ============================================
create table if not exists public.symptom_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  log_date date not null,
  symptom text not null,
  intensity integer check (intensity between 1 and 10),
  notes text,
  week_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.symptom_log enable row level security;
create policy "Users can manage their own symptom logs"
  on public.symptom_log for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: mood_log
-- ============================================
create table if not exists public.mood_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  log_date date not null,
  mood text not null,
  energy_level integer check (energy_level between 1 and 10),
  notes text,
  week_number integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mood_log enable row level security;
create policy "Users can manage their own mood logs"
  on public.mood_log for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: journal_entries
-- ============================================
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  entry_date date not null,
  week_number integer,
  title text,
  content text not null,
  photo_urls text[],
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.journal_entries enable row level security;
create policy "Users can manage their own journal entries"
  on public.journal_entries for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: reminders
-- ============================================
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  title text not null,
  reminder_type text check (reminder_type in ('control', 'vitamina', 'estudio', 'vacuna', 'otro')) not null,
  reminder_datetime timestamp with time zone not null,
  recurrence text check (recurrence in ('diario', 'semanal', 'mensual', 'unico')) default 'unico',
  is_active boolean default true,
  is_completed boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;
create policy "Users can manage their own reminders"
  on public.reminders for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: kick_sessions
-- ============================================
create table if not exists public.kick_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  session_start timestamp with time zone not null,
  session_end timestamp with time zone,
  kick_count integer default 0,
  week_number integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.kick_sessions enable row level security;
create policy "Users can manage their own kick sessions"
  on public.kick_sessions for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: baby_names
-- ============================================
create table if not exists public.baby_names (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  gender text check (gender in ('niño', 'niña', 'unisex')),
  origin text,
  meaning text,
  rating integer check (rating between 1 and 5),
  is_favorite boolean default false,
  partner_approved boolean,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.baby_names enable row level security;
create policy "Users can manage their own baby names"
  on public.baby_names for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: birth_checklist_items
-- ============================================
create table if not exists public.birth_checklist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pregnancy_id uuid references public.pregnancy_profile on delete cascade not null,
  category text not null,
  item text not null,
  is_completed boolean default false,
  priority text check (priority in ('alta', 'media', 'baja')) default 'media',
  due_week integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.birth_checklist_items enable row level security;
create policy "Users can manage their own checklist items"
  on public.birth_checklist_items for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: weekly_info (datos estáticos por semana)
-- ============================================
create table if not exists public.weekly_info (
  week_number integer primary key check (week_number between 1 and 42),
  trimester integer not null,
  fruit_comparison text not null,
  fruit_emoji text not null,
  baby_size_cm numeric,
  baby_weight_grams numeric,
  development_summary text not null,
  mom_symptoms text,
  tips text,
  important_tests text
);

-- weekly_info es de solo lectura para todos los usuarios autenticados
alter table public.weekly_info enable row level security;
create policy "Authenticated users can read weekly info"
  on public.weekly_info for select
  to authenticated
  using (true);
