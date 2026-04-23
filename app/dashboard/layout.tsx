'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Prescribe Tu Multa
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-4">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
            >
              📊 Mi Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary"
            >
              ➕ Nueva Multa
            </Link>
          </nav>

          <hr className="my-8" />

          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-semibold">LEGAL</p>
            <Link
              href="/legal/terms"
              className="block text-sm text-gray-600 hover:text-primary"
            >
              Términos de servicio
            </Link>
            <Link
              href="/legal/privacy"
              className="block text-sm text-gray-600 hover:text-primary"
            >
              Política de privacidad
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
