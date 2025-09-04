import { Check, Edit3, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../lib/i18n';

type MetadataEditorProps = {
  metadata: Record<string, unknown>;
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
      value: String(value),
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
        <Button
          size="small"
          variant="tertiary"
          onClick={addEntry}
          disabled={!(newKey.trim() && newValue.trim())}
          aria-label={t('add-metadata-pair')}
        >
          <Plus size={16} />
        </Button>
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
        <Button size="small" variant="primary" onClick={handleSave}>
          <Check />
        </Button>
        <Button size="small" variant="secondary" onClick={handleCancel}>
          <X />
        </Button>
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
      <Button
        size="small"
        variant="tertiary"
        onClick={() => onEdit(entry.id)}
        aria-label={t('edit-metadata')}
      >
        <Edit3 size={16} />
      </Button>
      <Button
        size="small"
        variant="tertiary"
        onClick={() => onRemove(entry.id)}
        aria-label={t('remove-metadata')}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
