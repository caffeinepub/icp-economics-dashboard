import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUserPreferences } from '../hooks/useQueries';
import LiveDataIndicator from './LiveDataIndicator';

interface HeaderProps {
  onConfigClick: () => void;
}

export default function Header({ onConfigClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: preferences } = useUserPreferences('default-user');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const appName = preferences?.customAppName || 'ICP Economics Dashboard';
  const logoPath = preferences?.customLogoPath;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src={logoPath || '/assets/generated/icp-logo.png'} 
              alt="ICP Logo" 
              className="h-8 w-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/generated/icp-logo.png';
              }}
            />
            <h1 className="text-xl font-bold text-foreground">{appName}</h1>
          </div>
          <LiveDataIndicator />
        </div>

        <div className="flex items-center space-x-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onConfigClick}
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configuration</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
