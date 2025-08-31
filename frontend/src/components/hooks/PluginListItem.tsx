import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

type PluginListItemProps = {
  plugin: { name: string; enabled: boolean };
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
  } = useSortable({ id: plugin.name });

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
      <div
        className="flex flex-1 cursor-grab items-center gap-3 hover:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          <GripVertical size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="select-none truncate font-medium text-gray-900 dark:text-gray-100">
            {plugin.name}
          </h4>
        </div>
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
