import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';

export default function HooksPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">{t('hooks')}</h1>
      <p className="text-gray-600 dark:text-gray-300">
        {language === 'en'
          ? 'This is the Hooks editing page, which will be used to manage plugins and hook configurations.'
          : '这是 Hooks 编辑页面，将用于管理插件和 Hook 配置。'}
      </p>
    </div>
  );
}
