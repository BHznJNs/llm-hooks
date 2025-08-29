import type { Language } from '../types';

type Translations = {
  [key in Language]: {
    [translationKey: string]: string;
  };
};

const translations: Translations = {
  en: {
    hooks: 'Hooks',
    logs: 'Logs',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    english: 'English',
    chinese: 'Chinese',
  },
  zh: {
    hooks: '钩子',
    logs: '日志',
    settings: '设置',
    theme: '主题',
    language: '语言',
    light: '浅色',
    dark: '深色',
    system: '系统',
    english: '英文',
    chinese: '中文',
  },
};

export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t };
};
