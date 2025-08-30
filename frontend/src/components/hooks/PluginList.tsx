import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import type { HookType, PluginItem } from '../../types/hooks';
import { PluginListItem } from './PluginListItem';

type PluginListProps = {
  plugins: PluginItem[];
  hookType: HookType;
  onOrderChange: (hookType: HookType, newOrder: string[]) => void;
};

export function PluginList({
  plugins,
  hookType,
  onOrderChange,
}: PluginListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = plugins.findIndex((plugin) => plugin.id === active.id);
      const newIndex = plugins.findIndex((plugin) => plugin.id === over.id);

      const reorderedPlugins = arrayMove(plugins, oldIndex, newIndex);
      onOrderChange(
        hookType,
        reorderedPlugins.map((p) => p.id)
      );
    }

    setActiveId(null);
  };

  const activePlugin = activeId ? plugins.find((p) => p.id === activeId) : null;

  if (plugins.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <p>暂无插件</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={plugins.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <PluginListItem key={plugin.id} plugin={plugin} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activePlugin ? (
          <PluginListItem plugin={activePlugin} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
