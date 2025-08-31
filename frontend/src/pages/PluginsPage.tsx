import { ChevronDown, Filter, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PluginListItem } from '../components/plugins/PluginListItem';
import { useTranslation } from '../lib/i18n';
import { useLanguageStore } from '../stores/language-store';
import { usePluginsStore } from '../stores/plugins-store';
import type { Plugin } from '../types/plugin';

export default function PluginsPage() {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const { plugins, fetchPlugins, togglePluginEnabled } = usePluginsStore();

  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  const filteredPlugins = plugins.filter((plugin) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch =
      searchText === '' || plugin.name.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'enabled' && plugin.enabled) ||
      (filterStatus === 'disabled' && !plugin.enabled);

    return matchesSearch && matchesStatus;
  });

  const enabledPlugins = plugins.filter((p) => p.enabled).length;
  const disabledPlugins = plugins.length - enabledPlugins;

  // 模态框功能暂未实现
  const handleAddPlugin = () => {
    // TODO: 实现添加插件功能
  };

  const handleEditPlugin = (_plugin: Plugin) => {
    // TODO: 实现编辑插件功能
  };

  const handleDeletePlugin = (_name: string) => {
    // TODO: 实现删除插件功能
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-6 dark:bg-gray-900">
      <header className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-8 rounded-lg bg-white px-6 py-4 shadow-custom dark:bg-gray-800">
            <div className="flex items-baseline gap-3 border-gray-200 border-r pr-8 dark:border-gray-600">
              <p className="font-bold text-gray-900 dark:text-white">
                {t('enabled')}
              </p>
              <span className="font-bold text-green-600 text-xl dark:text-green-400">
                {enabledPlugins}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="font-bold text-gray-900 dark:text-white">
                {t('disabled')}
              </p>
              <span className="font-bold text-gray-500 text-xl dark:text-gray-400">
                {disabledPlugins}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddPlugin}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
          >
            <Plus size={16} />
            <span>{t('add-plugin')}</span>
          </button>
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
              plugin={plugin}
              onToggle={togglePluginEnabled}
              onEdit={handleEditPlugin}
              onDelete={handleDeletePlugin}
            />
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">{t('no-matching-plugins')}</p>
            <p className="mt-2 text-sm">{t('adjust-search-filter')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
