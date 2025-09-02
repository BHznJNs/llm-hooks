import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormField } from '../components/settings/FormField';
import { PasswordField } from '../components/settings/PasswordField';
import { ProviderSelect } from '../components/settings/ProviderSelect';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';
import { useSettingsStore } from '../stores/settings-store';
import { useToastStore } from '../stores/toast-store';

const validateUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function SettingsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const { showToast } = useToastStore();
  const {
    upstream,
    assistant,
    hasChanges,
    isSaving,
    isLoading,
    loadSettings,
    updateUpstream,
    updateAssistant,
    saveSettings,
  } = useSettingsStore();

  const [errors, setErrors] = useState({
    upstreamBaseUrl: '',
    assistantBaseUrl: '',
    assistantModel: '',
    assistantApiKey: '',
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: on mounted callback
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (upstream === null || assistant === null) {
      loadSettings().catch((error) => {
        showToast(`加载设置失败：${error.message}`, 'error');
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {
      upstreamBaseUrl: '',
      assistantBaseUrl: '',
      assistantModel: '',
      assistantApiKey: '',
    };

    if (!upstream?.baseUrl) {
      newErrors.upstreamBaseUrl = t('base-url-required');
    } else if (!validateUrl(upstream.baseUrl)) {
      newErrors.upstreamBaseUrl = t('base-url-invalid');
    }

    if (!assistant?.baseUrl) {
      newErrors.assistantBaseUrl = t('base-url-required');
    } else if (!validateUrl(assistant.baseUrl)) {
      newErrors.assistantBaseUrl = t('base-url-invalid');
    }

    if (!assistant?.model) {
      newErrors.assistantModel = t('model-required');
    }

    if (!assistant?.apiKey) {
      newErrors.assistantApiKey = t('api-key-required');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  if (isLoading || !(upstream && assistant)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="px-10 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>{/* Empty element */}</div>
          <div className="flex gap-3">
            <Button
              size="medium"
              variant="primary"
              onClick={async () => {
                if (!validateForm()) {
                  return;
                }
                try {
                  await saveSettings();
                  showToast('设置保存成功', 'success');
                } catch (error) {
                  showToast(
                    `保存设置失败：${(error as Error).message}`,
                    'error'
                  );
                }
              }}
              disabled={!hasChanges || isSaving}
            >
              <Save size={16} />
              {isSaving ? t('saving') : t('save-settings')}
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* upstream settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 font-semibold text-gray-900 text-lg dark:text-white">
              {t('upstream-config')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                label={t('base-url')}
                error={errors.upstreamBaseUrl}
                required
                htmlFor="upstream-base-url"
              >
                <input
                  type="url"
                  id="upstream-base-url"
                  value={upstream!.baseUrl}
                  onChange={(e) => updateUpstream({ baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-600"
                />
              </FormField>
              <FormField
                label={t('provider')}
                required
                htmlFor="upstream-provider"
              >
                <ProviderSelect
                  id="upstream-provider"
                  value={upstream!.provider}
                  onChange={(value) => updateUpstream({ provider: value })}
                  required
                />
              </FormField>
            </div>
          </div>

          {/* assistant settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 font-semibold text-gray-900 text-lg dark:text-white">
              {t('assistant-config')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                label={t('base-url')}
                error={errors.assistantBaseUrl}
                required
                htmlFor="assistant-base-url"
              >
                <input
                  type="url"
                  id="assistant-base-url"
                  value={assistant!.baseUrl}
                  onChange={(e) => updateAssistant({ baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-600"
                />
              </FormField>
              <FormField
                label={t('provider')}
                required
                htmlFor="assistant-provider"
              >
                <ProviderSelect
                  id="assistant-provider"
                  value={assistant!.provider}
                  onChange={(value) => updateAssistant({ provider: value })}
                  required
                />
              </FormField>
              <FormField
                label={t('model')}
                error={errors.assistantModel}
                required
                htmlFor="assistant-model"
              >
                <input
                  type="text"
                  id="assistant-model"
                  value={assistant!.model}
                  onChange={(e) => updateAssistant({ model: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-600"
                />
              </FormField>
              <FormField
                label={t('api-key')}
                error={errors.assistantApiKey}
                required
                htmlFor="assistant-api-key"
              >
                <PasswordField
                  id="assistant-api-key"
                  value={assistant!.apiKey}
                  onChange={(value) => updateAssistant({ apiKey: value })}
                  required
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
