import { Link, useLocation } from '@tanstack/react-router';
import {
  FileText,
  Monitor,
  Moon,
  Puzzle,
  Scroll,
  Settings,
  Sun,
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getRouteConfig } from '../lib/routes-config';
import { useLanguageStore } from '../stores/language-store';
import { useThemeStore } from '../stores/theme-store';
import type { Language } from '../types';

export default function Sidebar() {
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();
  const { t } = useTranslation(language);
  const routes = getRouteConfig(language);
  const location = useLocation();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white p-4 shadow-md dark:bg-gray-800">
      <div className="mb-8 font-bold text-2xl dark:text-white">LLM Hooks</div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {routes.map((route) => (
            <li key={route.path}>
              <Link
                to={route.path}
                className={`flex items-center rounded px-4 py-2 ${
                  location.pathname === route.path
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {route.icon === 'hook' && <FileText className="mr-3 h-5 w-5" />}
                {route.icon === 'log' && <Scroll className="mr-3 h-5 w-5" />}
                {route.icon === 'settings' && (
                  <Settings className="mr-3 h-5 w-5" />
                )}
                {route.icon === 'plugin' && <Puzzle className="mr-3 h-5 w-5" />}
                <span>{t(route.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t pt-4 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium text-gray-700 text-sm dark:text-gray-300">
            {t('theme')}
          </span>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`cursor-pointer rounded p-2 ${
                theme === 'light'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label="Light theme"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`cursor-pointer rounded p-2 ${
                theme === 'dark'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label="Dark theme"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`cursor-pointer rounded p-2 ${
                theme === 'system'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label="System theme"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label
            htmlFor="language-select"
            className="font-medium text-gray-700 text-sm dark:text-gray-300"
          >
            {t('language')}
          </label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            className="ml-2 w-24 rounded border border-gray-300 bg-white p-1 pl-2 text-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="zh">简体中文</option>
          </select>
        </div>
      </div>
    </div>
  );
}
