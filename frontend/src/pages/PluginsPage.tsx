import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';

export default function PluginsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-bold text-3xl dark:text-white">
        {t('plugins')}
      </h1>
      <div className="rounded-lg border bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300">
          {t('plugins-description')}
        </p>
        <div className="mt-4">
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-gray-300 border-dashed dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              {t('plugins-coming-soon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
