import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';

export default function LogsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">{t('logs')}</h1>
      <p className="text-gray-600 dark:text-gray-300">
        {language === 'en'
          ? 'This is the logs page, which will be used to display system logs.'
          : '这是日志页面，将用于显示系统日志。'}
      </p>
    </div>
  );
}
