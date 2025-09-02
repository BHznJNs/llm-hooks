import { Save } from 'lucide-react';
import { useEffect } from 'react';
import type { HookType } from '../../../common/types/hook';
import { HookCollapse } from '../components/hooks/HookCollapse';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../lib/i18n';
import { useHooksStore } from '../stores/hooks-store';
import { useLanguageStore } from '../stores/language-store';
import { useToastStore } from '../stores/toast-store';

const HOOK_TYPES: HookType[] = [
  'beforeUpstreamRequest',
  'onUpstreamChunk',
  'afterUpstreamResponse',
  'onFetchModelList',
];

export default function HooksPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const { showToast } = useToastStore();
  const { hasChanges, isSaving, isLoading, saveChanges, fetchHooks } =
    useHooksStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: onmounted data fetch
  useEffect(() => {
    fetchHooks().catch((error) => {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to load hooks configuration',
        'error'
      );
    });
  }, [fetchHooks, showToast]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 px-10 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('hooks-description')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="medium"
              variant="primary"
              onClick={() => {
                saveChanges().catch((error) => {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : 'Failed to save hooks configuration',
                    'error'
                  );
                });
              }}
              disabled={!hasChanges || isSaving || isLoading}
            >
              <Save size={16} className={isSaving ? 'animate-spin' : ''} />
              {isSaving ? t('saving') : t('save-changes')}
            </Button>
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
