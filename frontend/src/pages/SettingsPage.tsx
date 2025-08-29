import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';

export default function SettingsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">{t('settings')}</h1>
      <p className="text-gray-600 dark:text-gray-300">
        {language === 'en'
          ? 'This is the settings page, which will be used to configure system settings.'
          : '这是设置页面，将用于配置系统设置。'}
      </p>
    </div>
  );
}
