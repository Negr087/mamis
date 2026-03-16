import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 text-center">
      {/* Hero */}
      <div className="max-w-lg animate-fade-in">
        <div className="text-6xl mb-6">🤰</div>
        <h1
          className="text-4xl md:text-5xl font-bold text-warm-900 mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Bumpy
        </h1>
        <p className="text-lg text-warm-600 mb-2">
          Tu compañera de embarazo
        </p>
        <p className="text-warm-500 mb-10 max-w-md mx-auto leading-relaxed">
          Seguí semana a semana el crecimiento de tu bebé, registrá tus controles
          médicos y creá un diario de este momento único.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3.5 bg-brand-500 text-white rounded-full font-semibold text-sm hover:bg-brand-600 transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-500/20"
          >
            Comenzar gratis
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 bg-white text-warm-700 rounded-full font-semibold text-sm border border-warm-200 hover:border-warm-300 transition-all hover:-translate-y-0.5"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>

      {/* Features preview */}
      <div className="mt-20 max-w-2xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        {[
          { emoji: '📅', label: 'Semana a semana' },
          { emoji: '🍎', label: 'Tamaño del bebé' },
          { emoji: '📋', label: 'Controles médicos' },
          { emoji: '📓', label: 'Diario personal' },
        ].map((f) => (
          <div
            key={f.label}
            className="bg-white rounded-2xl p-5 border border-warm-100 text-center hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">{f.emoji}</div>
            <div className="text-xs font-semibold text-warm-600">{f.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-warm-400">
        Hecho con 💛 para futuras mamás y papás
      </p>
    </main>
  );
}
