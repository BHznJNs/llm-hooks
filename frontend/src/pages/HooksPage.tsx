import { AlertCircle, Save } from 'lucide-react';
import { useEffect } from 'react';
import type { HookType } from '../../../common/types/hook';
import { HookCollapse } from '../components/hooks/HookCollapse';
import { useTranslation } from '../lib/i18n';
import { useHooksStore } from '../stores/hooks-store';
import { useLanguageStore } from '../stores/language-store';

const HOOK_TYPES: HookType[] = [
  'beforeUpstreamRequest',
  'onUpstreamChunk',
  'afterUpstreamResponse',
  'onFetchModelList',
];

export default function HooksPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const {
    hasChanges,
    isSaving,
    isLoading,
    loadingError,
    saveChanges,
    fetchHooks,
  } = useHooksStore();

  useEffect(() => {
    fetchHooks();
  }, [fetchHooks]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 px-10 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('hooks-description')}
            </p>
            {loadingError && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">{loadingError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveChanges}
              disabled={!hasChanges || isSaving || isLoading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                !hasChanges || isSaving || isLoading
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
                  : 'cursor-pointer bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
              }
              `}
            >
              <Save size={16} className={isSaving ? 'animate-spin' : ''} />
              {isSaving ? t('saving') : t('save-changes')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-10 pb-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {HOOK_TYPES.map((hookType) => (
                <div
                  key={hookType}
                  className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600" />
                      <div className="h-5 w-32 rounded bg-gray-300 dark:bg-gray-600" />
                    </div>
                    <div className="h-6 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            HOOK_TYPES.map((hookType) => (
              <HookCollapse key={hookType} hookType={hookType} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
