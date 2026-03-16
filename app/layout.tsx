import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Bumpy — Seguimiento de Embarazo',
    template: '%s | Bumpy',
  },
  description: 'Acompañamos tu embarazo semana a semana con información, seguimiento médico y herramientas inteligentes.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#faf8f5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-warm-50 text-warm-900 min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #e8e0d4',
              color: '#3b2a1a',
            },
          }}
        />
      </body>
    </html>
  );
}
