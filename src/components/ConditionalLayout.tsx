'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full lg:ml-0">
        {children}
      </main>
    </div>
  );
}
