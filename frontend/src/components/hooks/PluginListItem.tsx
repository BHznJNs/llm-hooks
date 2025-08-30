import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { PluginItem } from '../../types/hooks';

type PluginListItemProps = {
  plugin: PluginItem;
  isDragOverlay?: boolean;
};

export function PluginListItem({
  plugin,
  isDragOverlay = false,
}: PluginListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plugin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors dark:border-gray-700 dark:bg-gray-800 ${isDragging || isDragOverlay ? 'opacity-50' : 'opacity-100'}
        ${plugin.enabled ? '' : 'opacity-60'}
      `}
    >
      <button
        className="cursor-grab text-gray-400 hover:cursor-grabbing hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
          {plugin.name}
        </h4>
        {plugin.description && (
          <p className="truncate text-gray-500 text-sm dark:text-gray-400">
            {plugin.description}
          </p>
        )}
      </div>

      <div
        className={`h-2 w-2 flex-shrink-0 rounded-full ${
          plugin.enabled
            ? 'bg-green-500 dark:bg-green-400'
            : 'bg-gray-300 dark:bg-gray-600'
        }
      `}
      />
    </div>
  );
}
