import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { FileCode, Package, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PluginConfig } from '../../../../common/types/config';
import { pluginsApi } from '../../api/plugins';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/language-store';
import { useToastStore } from '../../stores/toast-store';
import { MetadataEditor } from './MetadataEditor';
import { ScriptEditor, type ScriptEditorHandle } from './ScriptEditor';

type PluginType = 'js' | 'ts' | 'npm' | 'unknown';
type EditPluginModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlugin: (plugin: {
    name: string;
    metadata: Record<string, unknown>;
    content: string;
  }) => Promise<void>;
  onEditPlugin: (plugin: {
    name: string;
    metadata: Record<string, unknown>;
    content: string;
  }) => Promise<void>;
  isEditMode: boolean;
  editingConfig?: PluginConfig & { name: string };
};

const pluginTypeIconSize = 24;
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

function parseMetadata(
  rawMetadata: Record<string, string>
): Record<string, unknown> {
  function parseValue(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  const newMetadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawMetadata)) {
    newMetadata[key] = parseValue(value);
  }
  return newMetadata;
}

function PluginIcon({
  pluginType,
  className,
}: {
  pluginType: PluginType;
  className?: string;
}) {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
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
    <div className={className} title={getPluginTypeTitle()}>
      {(() => {
        switch (pluginType) {
          case 'js':
          case 'ts': {
            return (
              <FileCode
                size={pluginTypeIconSize}
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
                size={pluginTypeIconSize}
                className="text-green-600"
                aria-label={t('plugin-type-npm')}
              />
            );
          }
          default: {
            return (
              <Package
                size={pluginTypeIconSize}
                className="text-gray-400"
                aria-label="Unknown plugin type"
              />
            );
          }
        }
      })()}
    </div>
  );
}

export function EditPluginModal({
  isOpen,
  onOpenChange,
  onAddPlugin,
  onEditPlugin,
  isEditMode,
  editingConfig,
}: EditPluginModalProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const { showToast } = useToastStore();

  const [pluginName, setPluginName] = useState('');
  const [pluginType, setPluginType] = useState<PluginType>('unknown');
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const scriptEditorRef = useRef<ScriptEditorHandle>(null);
  const confirmCallback = isEditMode ? onEditPlugin : onAddPlugin;

  // When in edit mode and plugin changes, update the state
  useEffect(() => {
    if (!isEditMode) {
      setPluginName('');
      setPluginType('unknown');
      setMetadata({});
      scriptEditorRef.current?.setValue('');
      return;
    }
    if (!editingConfig) {
      return;
    }
    setPluginName(editingConfig.name);
    setPluginType(getPluginType(editingConfig.name));
    setMetadata(editingConfig.params);
    pluginsApi
      .getContent(editingConfig.name)
      .then((content: string) => {
        scriptEditorRef.current?.setValue(content);
      })
      .catch((error) => {
        showToast(
          error instanceof Error ? error.message : 'Failed to load plugin',
          'error'
        );
      });
  }, [isEditMode, editingConfig, showToast]);

  useEffect(() => {
    const type = getPluginType(pluginName.trim());
    setPluginType(type);
  }, [pluginName]);

  const validatePlugin = () => {
    if (!pluginName.trim()) {
      throw new Error(t('plugin-validate-require-name'));
    }
    // Check metadata keys uniqueness
    const keys = Object.keys(metadata);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      throw new Error(t('plugin-validate-unique-key'));
    }
  };

  const handleCloseClick = () => {
    onOpenChange(false);
  };

  const handleConfirmClick = async () => {
    try {
      validatePlugin();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Plugin validation failed',
        'error'
      );
      return;
    }

    setIsSaving(true);
    await confirmCallback({
      name: pluginName,
      metadata,
      content: scriptEditorRef.current?.getValue() ?? '',
    });
    setIsSaving(false);
    handleCloseClick();
  };

  const handleMetadataChange = (newMetadata: Record<string, string>) => {
    const parsedData = parseMetadata(newMetadata);
    setMetadata(parsedData);
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
              {isEditMode ? t('edit-plugin') : t('add-plugin-modal-title')}
            </DialogTitle>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            {/* Plugin Name Input */}
            <div className="flex items-center gap-2">
              <PluginIcon className="mr-2" pluginType={pluginType} />
              <div className="relative flex-1">
                <label htmlFor="plugin-name" className="sr-only">
                  {t('plugin-name-placeholder')}
                </label>
                <input
                  id="plugin-name"
                  type="text"
                  placeholder={t('plugin-name-placeholder')}
                  value={pluginName}
                  onChange={(e) => setPluginName(e.target.value.trim())}
                  disabled={isEditMode}
                  className={`w-full rounded border border-gray-300 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-600 ${
                    isEditMode ? 'cursor-not-allowed' : ''
                  }`}
                />
                {!isEditMode && pluginName && (
                  <button
                    type="button"
                    onClick={() => setPluginName('')}
                    className="-translate-y-1/2 absolute top-1/2 right-3 cursor-pointer"
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
                ref={scriptEditorRef}
                scriptType={pluginType === 'ts' ? 'typescript' : 'javascript'}
              />
            )}
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <DialogClose asChild>
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={handleCloseClick}
              >
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              disabled={isSaving}
              onClick={handleConfirmClick}
            >
              {t('confirm')}
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
