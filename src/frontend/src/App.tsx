import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ConfigurationMenu from './components/ConfigurationMenu';
import { useUserPreferences } from './hooks/useQueries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // 1 minute
    },
  },
});

function AppContent() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { data: preferences } = useUserPreferences();

  return (
    <div className="min-h-screen bg-background">
      <Header onConfigClick={() => setIsConfigOpen(true)} />
      <main className="container mx-auto px-4 py-6">
        <Dashboard />
      </main>
      <ConfigurationMenu 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025. Built with love using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
