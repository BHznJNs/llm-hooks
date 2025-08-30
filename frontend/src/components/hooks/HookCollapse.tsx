import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { useHooksStore } from '../../stores/hooks-store';
import type { Language } from '../../types';
import type { PluginItem } from '../../types/hooks';
import { PluginList } from './PluginList';

type HookCollapseProps = {
  hookType:
    | 'beforeUpstreamRequest'
    | 'onUpstreamChunk'
    | 'afterUpstreamResponse'
    | 'onFetchModelList';
  language: Language;
};

export function HookCollapse({ hookType, language }: HookCollapseProps) {
  const { hooks, availablePlugins, updateHookOrder } = useHooksStore();
  const [open, setOpen] = useState(true);

  const hookPlugins = hooks[hookType]
    .map((pluginId) => availablePlugins.find((p) => p.id === pluginId))
    .filter((plugin): plugin is PluginItem => Boolean(plugin));

  const hookLabels = {
    beforeUpstreamRequest:
      language === 'en' ? 'Before Upstream Request' : '请求前处理',
    onUpstreamChunk: language === 'en' ? 'On Upstream Chunk' : '流式响应处理',
    afterUpstreamResponse:
      language === 'en' ? 'After Upstream Response' : '响应后处理',
    onFetchModelList:
      language === 'en' ? 'On Fetch Model List' : '模型列表获取处理',
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between bg-gray-100 p-4 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
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
          {hookPlugins.length}
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
