import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { FileCode, Package, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/language-store';
import { MetadataEditor } from './MetadataEditor';
import { ScriptEditor } from './ScriptEditor';

type PluginType = 'js' | 'ts' | 'npm' | 'unknown';

const iconSize = 24;
const PLUGIN_NAME_REGEX = /^[a-z0-9-_]+$/i;

function getPluginType(name: string): PluginType {
  if (name.endsWith('.ts')) {
    return 'ts';
  }
  if (name.endsWith('.js')) {
    return 'js';
  }
  if (PLUGIN_NAME_REGEX.test(name)) {
    return 'npm';
  }
  return 'unknown';
}

type AddPluginModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlugin: (plugin: {
    name: string;
    type: PluginType;
    metadata: Record<string, string>;
    content: string;
  }) => void;
  existingPluginNames: string[];
};

export function AddPluginModal({
  isOpen,
  onOpenChange,
  onAddPlugin,
  existingPluginNames,
}: AddPluginModalProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  const [pluginName, setPluginName] = useState('');
  const [pluginType, setPluginType] = useState<PluginType>('unknown');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = getPluginType(pluginName.trim());
    setPluginType(type);
  }, [pluginName]);

  const resetState = () => {
    setPluginName('');
    setPluginType('unknown');
    setMetadata({});
    setContent('');
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const validatePlugin = (): string | null => {
    if (pluginName.trim() === '') {
      return t('plugin-validate-require-name');
    }

    if (existingPluginNames.includes(pluginName.trim())) {
      return t('duplicate-plugin-name');
    }

    // Check metadata keys uniqueness
    const keys = Object.keys(metadata);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      return t('plugin-validate-unique-key');
    }

    return null;
  };

  const handleAddClick = () => {
    const validationError = validatePlugin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onAddPlugin({
      name: pluginName.trim(),
      type: pluginType,
      metadata,
      content,
    });
    handleClose();
  };

  const handleMetadataChange = useCallback(
    (newMetadata: Record<string, string>) => {
      setMetadata(newMetadata);
    },
    []
  );

  const onContentChange = useCallback((val: string | undefined) => {
    if (val === undefined) {
      return;
    }
    setContent(val);
  }, []);

  const renderIcon = () => {
    switch (pluginType) {
      case 'js':
      case 'ts': {
        return (
          <FileCode
            size={iconSize}
            className="text-blue-600"
            aria-label={t(
              `plugin-type-${pluginType === 'js' ? 'javascript' : 'typescript'}`
            )}
          />
        );
      }
      case 'npm': {
        return (
          <Package
            size={iconSize}
            className="text-green-600"
            aria-label={t('plugin-type-npm')}
          />
        );
      }
      default: {
        return (
          <Package
            size={iconSize}
            className="text-gray-400"
            aria-label="Unknown plugin type"
          />
        );
      }
    }
  };

  const getPluginTypeTitle = () => {
    switch (pluginType) {
      case 'js':
        return t('plugin-type-javascript');
      case 'ts':
        return t('plugin-type-typescript');
      case 'npm':
        return t('plugin-type-npm');
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black opacity-50" />
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className={
            '-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 flex max-h-10/12 w-full max-w-4xl transform flex-col overflow-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'
          }
        >
          <div className="mb-6 flex items-center justify-between">
            <DialogTitle className="font-semibold text-gray-900 text-lg dark:text-white">
              {t('add-plugin-modal-title')}
            </DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 focus:outline-none dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </DialogClose>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            {/* Plugin Name Input */}
            <div className="flex items-center gap-2">
              <div className="mr-2" title={getPluginTypeTitle()}>
                {renderIcon()}
              </div>
              <div className="relative flex-1">
                <label htmlFor="plugin-name" className="sr-only">
                  {t('plugin-name-placeholder')}
                </label>
                <input
                  id="plugin-name"
                  type="text"
                  placeholder={t('plugin-name-placeholder')}
                  value={pluginName}
                  onChange={(e) => setPluginName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-600"
                />
                {pluginName && (
                  <button
                    type="button"
                    onClick={() => setPluginName('')}
                    className="-translate-y-1/2 absolute top-1/2 right-2 cursor-pointer p-1 text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label="清除插件名称"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Metadata Editor */}
            <div>
              <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                {t('metadata')}
              </h3>
              <MetadataEditor
                metadata={metadata}
                onChange={handleMetadataChange}
              />
            </div>

            {/* Monaco Editor if JS or TS */}
            {(pluginType === 'js' || pluginType === 'ts') && (
              <ScriptEditor
                scriptType={pluginType === 'ts' ? 'typescript' : 'javascript'}
                initialContent={content}
                onChange={onContentChange}
              />
            )}
          </div>

          {error && (
            <div className="mt-3 text-red-600 text-sm dark:text-red-400">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <DialogClose asChild>
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
            </DialogClose>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleAddClick}
            >
              {t('add-plugin')}
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
