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
    plugins: 'Plugins',
    'plugins-description': 'Manage your LLM hooks plugins here',
    'plugins-coming-soon': 'Plugin management features coming soon...',
    'save-changes': 'Save Changes',
    saving: 'Saving...',
    'no-changes': 'No Changes',
    'hooks-description': 'Configure plugin execution order for each hook',
    'before-upstream-request': 'Before Upstream Request',
    'on-upstream-chunk': 'On Upstream Chunk',
    'after-upstream-response': 'After Upstream Response',
    'on-fetch-model-list': 'On Fetch Model List',
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
    plugins: '插件',
    'plugins-description': '在这里管理您的 LLM 钩子插件',
    'plugins-coming-soon': '插件管理功能即将推出...',
    'save-changes': '保存更改',
    saving: '保存中...',
    'no-changes': '无更改',
    'hooks-description': '配置每个钩子的插件执行顺序',
    'before-upstream-request': '请求前处理',
    'on-upstream-chunk': '流式响应处理',
    'after-upstream-response': '响应后处理',
    'on-fetch-model-list': '模型列表获取处理',
  },
};

export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t };
};
