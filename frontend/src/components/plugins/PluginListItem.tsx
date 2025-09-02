import { FilePenLine, Power, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/language-store';
import type { Plugin } from '../../types/plugin';

type PluginListItemProps = {
  plugin: Plugin;
  onToggle: (name: string) => void;
  onEdit: (plugin: Plugin) => void;
  onDelete: (name: string) => void;
};

export function PluginListItem({
  plugin,
  onToggle,
  onEdit,
  onDelete,
}: PluginListItemProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  const statusClass = plugin.enabled
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-gray-900 dark:text-white">
          {plugin.name}
        </span>
        <div
          className={`rounded-full px-2.5 py-0.5 font-medium text-xs ${statusClass}`}
        >
          {plugin.enabled ? t('enabled') : t('disabled')}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <Button
          size="small"
          variant="tertiary"
          onClick={() => onToggle(plugin.name)}
          className={`${
            plugin.enabled
              ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
              : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
          }`}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          size="small"
          variant="tertiary"
          onClick={() => onEdit(plugin)}
          className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
        >
          <FilePenLine className="h-4 w-4" />
        </Button>
        <Button
          size="small"
          variant="tertiary"
          onClick={() => onDelete(plugin.name)}
          className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
