import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from '../../lib/i18n';
import { useHooksStore } from '../../stores/hooks-store';
import { useLanguageStore } from '../../stores/language-store';
import type { HookType } from '../../types/hooks';
import { PluginList } from './PluginList';

type HookCollapseProps = {
  hookType: HookType;
};

export function HookCollapse({ hookType }: HookCollapseProps) {
  const { language } = useLanguageStore();
  const { hooks, pluginStates, updateHookOrder } = useHooksStore();
  const { t } = useTranslation(language);
  const [open, setOpen] = useState(true);

  const hookPlugins = hooks[hookType].map((pluginName) => ({
    name: pluginName,
    enabled: pluginStates[pluginName] ?? false,
  }));

  const hookLabels: Record<HookType, string> = {
    beforeUpstreamRequest: t('before-upstream-request'),
    onUpstreamChunk: t('on-upstream-chunk'),
    afterUpstreamResponse: t('after-upstream-response'),
    onFetchModelList: t('on-fetch-model-list'),
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown
              size={16}
              className="text-gray-600 dark:text-gray-300"
            />
          ) : (
            <ChevronRight
              size={16}
              className="text-gray-600 dark:text-gray-300"
            />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {hookLabels[hookType]}
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200">
          {hooks[hookType].length}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="bg-gray-50 p-4 dark:bg-gray-800">
        <PluginList
          plugins={hookPlugins}
          hookType={hookType}
          onOrderChange={updateHookOrder}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
