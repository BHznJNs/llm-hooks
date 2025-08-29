import { Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { useLanguageStore } from './stores/language-store';
import { useThemeStore } from './stores/theme-store';

export default function App() {
  const { language, setLanguage } = useLanguageStore();
  const { theme } = useThemeStore();
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const handleChangeRef = useRef<((e: MediaQueryListEvent) => void) | null>(
    null
  );

  // 根据主题更新 document 类名
  useEffect(() => {
    // 清理之前的事件监听器
    if (mediaQueryRef.current && handleChangeRef.current) {
      mediaQueryRef.current.removeEventListener(
        'change',
        handleChangeRef.current
      );
      mediaQueryRef.current = null;
      handleChangeRef.current = null;
    }

    if (theme === 'system') {
      // 检查系统主题偏好
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 监听系统主题变化
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

    // 清理函数
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar language={language} setLanguage={setLanguage} />

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
