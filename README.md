# 🤰 Bumpy — Pregnancy Tracking App

Aplicación web para el seguimiento del embarazo semana a semana.

## Setup

### 1. Instalar dependencias

```bash
cd bumpy
npm install
```

### 2. Configurar Supabase

Crear un archivo `.env.local` basado en `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con tus credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar el SQL

Si aún no lo hiciste, ejecutá el archivo `supabase-schema.sql` en el SQL Editor de Supabase.

### 4. Configurar Auth en Supabase

En Supabase Dashboard → Authentication → Providers:
- Habilitá Email (ya viene habilitado por defecto)
- Opcionalmente habilitá Google OAuth

En Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrí `http://localhost:3000` en el navegador.

## Estructura del proyecto

```
bumpy/
├── app/
│   ├── auth/           # Login, Register, Callback
│   ├── dashboard/      # Pantalla principal
│   ├── timeline/       # Línea de tiempo semanal
│   ├── health/         # Registros de salud
│   ├── journal/        # Diario del embarazo
│   ├── reminders/      # Recordatorios
│   ├── onboarding/     # Setup inicial
│   ├── profile/        # Perfil de usuario
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page
│   └── globals.css     # Estilos globales
├── components/
│   ├── ui/             # Componentes reutilizables
│   ├── dashboard/      # Componentes del dashboard
│   ├── timeline/       # Componentes de timeline
│   └── layout/         # AppLayout, Nav
├── hooks/              # Custom hooks (useAuth, useWeeklyInfo)
├── lib/                # Supabase clients, utilities
├── types/              # TypeScript types
└── public/             # Assets estáticos
```

## Tecnologías

- **Next.js 14** con App Router
- **Supabase** (Auth + PostgreSQL + Storage)
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Recharts** para gráficos
- **TypeScript** tipado completo

## Próximos pasos

- [ ] Página de Health con gráficos de peso/presión
- [ ] Página de Journal (diario)
- [ ] Upload de ecografías
- [ ] Contador de pataditas
- [ ] Generador de nombres con IA
- [ ] Explicador de análisis con IA
- [ ] PWA manifest para instalar como app
- [ ] Notificaciones push
