import { ChevronDown, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PluginConfig } from '../../../common/types/config';
import { EditPluginModal } from '../components/plugins/EditPluginModal';
import { PluginListItem } from '../components/plugins/PluginListItem';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';
import { usePluginsStore } from '../stores/plugins-store';
import { useToastStore } from '../stores/toast-store';

export default function PluginsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const {
    plugins,
    fetchPlugins,
    deletePlugin,
    updatePlugin,
    togglePlugin,
    createPlugin,
  } = usePluginsStore();
  const { showToast } = useToastStore();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingConfig, setEditingConfig] = useState<
    (PluginConfig & { name: string }) | undefined
  >();

  // biome-ignore lint/correctness/useExhaustiveDependencies: onMounted
  useEffect(() => {
    fetchPlugins().catch((error) => {
      showToast(
        error instanceof Error ? error.message : 'Failed to fetch plugins',
        'error'
      );
    });
  }, []);

  const pluginMap = plugins;
  const pluginData: (PluginConfig & { name: string })[] = Object.entries(
    pluginMap
  ).map(([name, config]) => ({ name, ...config }));

  const enabledPluginCount = pluginData.filter((p) => p.enabled).length;
  const disabledPluginCount = pluginData.length - enabledPluginCount;

  const filteredPlugins = pluginData.filter((plugin) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      searchText === '' || plugin.name.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'enabled' && plugin.enabled) ||
      (filterStatus === 'disabled' && !plugin.enabled);

    return matchesSearch && matchesStatus;
  });

  const handleAddPluginClick = () => {
    setEditingConfig(undefined);
    setIsPluginModalOpen(true);
    setIsEditMode(false);
  };

  const handleEditPluginClick = (name: string) => {
    const targetConfig = { name, ...pluginMap[name] };
    setEditingConfig(targetConfig);
    setIsPluginModalOpen(true);
    setIsEditMode(true);
  };

  const handleTogglePluginClick = async (name: string) => {
    try {
      await togglePlugin(name, !pluginMap[name].enabled);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update plugin',
        'error'
      );
    }
  };

  const handleDeletePluginClick = async (name: string) => {
    try {
      await deletePlugin(name);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to delete plugin',
        'error'
      );
    }
  };

  const handleAddPluginConfirm = async (newPlugin: {
    name: string;
    metadata: Record<string, unknown>;
    content: string;
  }) => {
    try {
      await createPlugin(newPlugin.name, {
        enabled: true,
        params: {},
        dependencies: [],
        content: newPlugin.content,
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create plugin',
        'error'
      );
    }
  };

  const handleEditPluginConfirm = async (editedConfig: {
    name: string;
    metadata: Record<string, unknown>;
    content: string;
  }) => {
    try {
      await updatePlugin(editedConfig.name, {
        enabled: pluginMap[editedConfig.name].enabled,
        params: editedConfig.metadata,
        dependencies: pluginMap[editedConfig.name].dependencies,
        content: editedConfig.content,
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update plugin',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-6 dark:bg-gray-900">
      <header className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-6 rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-custom dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-baseline gap-3">
              <p className="font-bold text-gray-900 dark:text-white">
                {t('enabled')}
              </p>
              <span className="font-bold text-green-600 text-xl dark:text-green-400">
                {enabledPluginCount}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-baseline gap-3">
              <p className="font-bold text-gray-900 dark:text-white">
                {t('disabled')}
              </p>
              <span className="font-bold text-gray-500 text-xl dark:text-gray-400">
                {disabledPluginCount}
              </span>
            </div>
          </div>
          <Button
            size="medium"
            variant="primary"
            onClick={handleAddPluginClick}
          >
            <Plus size={16} />
            <span>{t('add-plugin')}</span>
          </Button>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t('search-plugins')}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-12 text-gray-900 placeholder-gray-500 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-600"
          />
        </div>
        <div className="relative">
          <Filter className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-12 text-gray-900 shadow-input transition duration-300 focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-600"
          >
            <option value="all">{t('all-status')}</option>
            <option value="enabled">{t('enabled')}</option>
            <option value="disabled">{t('disabled')}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="pointer-events-none h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPlugins.length > 0 ? (
          filteredPlugins.map((plugin) => (
            <PluginListItem
              key={plugin.name}
              name={plugin.name}
              enabled={plugin.enabled}
              onToggle={handleTogglePluginClick}
              onEdit={handleEditPluginClick}
              onDelete={handleDeletePluginClick}
            />
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t('no-matching-plugins')}</p>
            <p className="mt-2 text-sm">{t('adjust-search-filter')}</p>
          </div>
        )}
      </div>

      <EditPluginModal
        isOpen={isPluginModalOpen}
        isEditMode={isEditMode}
        editingConfig={editingConfig}
        onOpenChange={setIsPluginModalOpen}
        onAddPlugin={handleAddPluginConfirm}
        onEditPlugin={handleEditPluginConfirm}
      />
    </div>
  );
}
