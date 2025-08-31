import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { useThemeStore } from './stores/theme-store';

export default function App() {
  const { theme } = useThemeStore();
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const handleChangeRef = useRef<((e: MediaQueryListEvent) => void) | null>(
    null
  );

  useEffect(() => {
    if (mediaQueryRef.current && handleChangeRef.current) {
      mediaQueryRef.current.removeEventListener(
        'change',
        handleChangeRef.current
      );
      mediaQueryRef.current = null;
      handleChangeRef.current = null;
    }

    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
      handleChangeRef.current = (e: MediaQueryListEvent) => {
        if (document.documentElement.classList.contains('dark') !== e.matches) {
          document.documentElement.classList.toggle('dark');
        }
      };

      mediaQueryRef.current.addEventListener('change', handleChangeRef.current);
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      if (mediaQueryRef.current && handleChangeRef.current) {
        mediaQueryRef.current.removeEventListener(
          'change',
          handleChangeRef.current
        );
      }
    };
  }, [theme]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
