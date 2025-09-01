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
import type { HookType } from '../../../../common/types/hook';
import { PluginListItem } from './PluginListItem';

type PluginListProps = {
  plugins: { name: string; enabled: boolean }[];
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
    // console.log(event);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = plugins.findIndex((plugin) => plugin.name === active.id);
      const newIndex = plugins.findIndex((plugin) => plugin.name === over.id);

      const reorderedPlugins = arrayMove(plugins, oldIndex, newIndex);
      onOrderChange(
        hookType,
        reorderedPlugins.map((p) => p.name)
      );
    }

    setActiveId(null);
  };

  const activePlugin = activeId
    ? plugins.find((p) => p.name === activeId)
    : null;

  // console.log(activePlugin);

  if (plugins.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <p>No plugins</p>
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
        items={plugins.map((p) => p.name)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {plugins.map((plugin) => (
            <PluginListItem key={plugin.name} plugin={plugin} />
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
