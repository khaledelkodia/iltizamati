import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import PageTransition from './PageTransition';

export default function AppShell() {
  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary overflow-x-hidden flex flex-col">
      {/* Dynamic Background Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-primary/5 blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-secondary/5 blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto min-h-screen pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px)+16px)]">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <div className="w-full max-w-md mx-auto">
         <BottomNav />
      </div>
    </div>
  );
}
