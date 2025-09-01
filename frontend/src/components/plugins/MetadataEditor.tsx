import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from '../../lib/i18n';

type MetadataEditorProps = {
  metadata: Record<string, string>;
  onChange: (metadata: Record<string, string>) => void;
};

type MetadataEntry = {
  key: string;
  value: string;
  id: string;
  isEditing?: boolean;
};

export function MetadataEditor({ metadata, onChange }: MetadataEditorProps) {
  const { t } = useTranslation('en');
  const [entries, setEntries] = useState<MetadataEntry[]>(() =>
    Object.entries(metadata).map(([key, value], index) => ({
      key,
      value,
      id: `${index}`,
      isEditing: false,
    }))
  );
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const updateMetadata = useCallback(
    (newEntries: MetadataEntry[]) => {
      const newMetadata: Record<string, string> = {};
      for (const entry of newEntries) {
        if (entry.key.trim() && entry.value.trim()) {
          newMetadata[entry.key.trim()] = entry.value.trim();
        }
      }
      onChange(newMetadata);
    },
    [onChange]
  );

  const addEntry = () => {
    if (newKey.trim() && newValue.trim()) {
      const newEntries = [
        ...entries,
        {
          key: newKey.trim(),
          value: newValue.trim(),
          id: Date.now().toString(),
          isEditing: false,
        },
      ];
      setEntries(newEntries);
      updateMetadata(newEntries);
      setNewKey('');
      setNewValue('');
    }
  };

  const removeEntry = (id: string) => {
    const newEntries = entries.filter((entry) => entry.id !== id);
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const startEdit = (id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isEditing: true } : entry
      )
    );
  };

  const saveEdit = (id: string, newKey_: string, newValue_: string) => {
    const newEntries = entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            key: newKey_.trim(),
            value: newValue_.trim(),
            isEditing: false,
          }
        : entry
    );
    setEntries(newEntries);
    updateMetadata(newEntries);
  };

  const cancelEdit = (id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isEditing: false } : entry
      )
    );
  };

  return (
    <div className="space-y-3">
      {/* Existing metadata entries */}
      {entries.map((entry) => (
        <MetadataEntryRow
          key={entry.id}
          entry={entry}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onEdit={startEdit}
          onRemove={removeEntry}
        />
      ))}

      {/* Add new metadata entry */}
      <div className="flex gap-2 rounded border border-gray-300 border-dashed p-3 dark:border-gray-600">
        <input
          type="text"
          placeholder={t('metadata-key-placeholder')}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder={t('metadata-value-placeholder')}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={addEntry}
          disabled={!(newKey.trim() && newValue.trim())}
          className="flex items-center justify-center rounded bg-blue-600 p-2 text-sm text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600 dark:focus:ring-blue-600"
          aria-label={t('add-metadata-pair')}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

type MetadataEntryRowProps = {
  entry: MetadataEntry;
  onSave: (id: string, key: string, value: string) => void;
  onCancel: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

function MetadataEntryRow({
  entry,
  onSave,
  onCancel,
  onEdit,
  onRemove,
}: MetadataEntryRowProps) {
  const { t } = useTranslation('en');
  const [editKey, setEditKey] = useState(entry.key);
  const [editValue, setEditValue] = useState(entry.value);

  const handleSave = () => {
    onSave(entry.id, editKey, editValue);
  };

  const handleCancel = () => {
    setEditKey(entry.key);
    setEditValue(entry.value);
    onCancel(entry.id);
  };

  if (entry.isEditing) {
    return (
      <div className="flex gap-2 rounded border border-gray-300 bg-blue-50 p-3 dark:border-gray-600 dark:bg-gray-800">
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={handleSave}
          className="cursor-pointer rounded bg-green-600 px-3 py-2 font-medium text-sm text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-green-600"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="cursor-pointer rounded bg-gray-500 px-3 py-2 font-medium text-sm text-white shadow-sm transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 dark:focus:ring-gray-600 dark:hover:bg-gray-700"
        >
          {t('cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-1">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {entry.key}:
        </span>{' '}
        <span className="text-gray-600 dark:text-gray-400">{entry.value}</span>
      </div>
      <button
        type="button"
        onClick={() => onEdit(entry.id)}
        className="flex cursor-pointer items-center justify-center rounded p-1.5 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
        aria-label={t('edit-metadata')}
      >
        <Edit3 size={16} />
      </button>
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="flex cursor-pointer items-center justify-center rounded p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        aria-label={t('remove-metadata')}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
