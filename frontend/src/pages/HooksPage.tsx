import { Save } from 'lucide-react';
import { HookCollapse } from '../components/hooks/HookCollapse';
import { useTranslation } from '../lib/i18n';
import { useHooksStore } from '../stores/hooks-store';
import { useLanguageStore } from '../stores/language-store';
import type { HookType } from '../types/hooks';

const HOOK_TYPES: HookType[] = [
  'beforeUpstreamRequest',
  'onUpstreamChunk',
  'afterUpstreamResponse',
  'onFetchModelList',
];

export default function HooksPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const { hasChanges, isSaving, saveChanges } = useHooksStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 px-10 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t('hooks-description')}
            </p>
          </div>

          <button
            type="button"
            onClick={saveChanges}
            disabled={!hasChanges}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              hasChanges
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
                : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
            }
            `}
          >
            <Save size={16} />
            {isSaving ? t('saving') : t('save-changes')}
          </button>
        </div>
      </div>

      <div className="flex-1 px-10 pb-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {HOOK_TYPES.map((hookType) => (
            <HookCollapse key={hookType} hookType={hookType} />
          ))}
        </div>
      </div>
    </div>
  );
}
