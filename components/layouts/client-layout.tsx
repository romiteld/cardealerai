'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import ChatAssistant from '../shared/chat-assistant';

export default function ClientLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="relative">
        {children}
        <Toaster 
          position="top-right"
          expand={true}
          richColors
          closeButton
          theme="dark"
        />
        <ChatAssistant />
      </main>
    </div>
  );
}
