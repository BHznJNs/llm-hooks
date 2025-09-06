import { create } from 'zustand';
import type { PluginConfig } from '../../../common/types/config.ts';
import { pluginsApi } from '../api/plugins.ts';

export type PluginsState = {
  plugins: Record<string, PluginConfig>;
  isLoading: boolean;

  // Actions
  fetchPlugins: () => Promise<void>;
  createPlugin: (
    name: string,
    newPluginConfig: PluginConfig & { content?: string }
  ) => Promise<void>;
  updatePlugin: (
    name: string,
    newConfig: PluginConfig & { content?: string }
  ) => Promise<void>;
  togglePlugin: (name: string, enabled: boolean) => Promise<void>;
  deletePlugin: (name: string) => Promise<void>;
};

export const usePluginsStore = create<PluginsState>((set, get) => ({
  plugins: {},
  isLoading: false,

  async fetchPlugins() {
    set({ isLoading: true });
    const pluginData = await pluginsApi.fetchAll();
    set({ plugins: pluginData, isLoading: false });
  },

  async createPlugin(name, newPluginConfig) {
    const isExist = await pluginsApi.has(name);
    if (isExist) {
      throw new Error('Plugin already exists');
    }
    await pluginsApi.create({ name, ...newPluginConfig });
    await get().fetchPlugins();
  },

  async updatePlugin(name, newConfig) {
    await pluginsApi.update({ name, ...newConfig });
    set((state) => ({
      ...state,
      plugins: {
        ...state.plugins,
        [name]: {
          enabled: newConfig.enabled,
          params: newConfig.params,
        },
      },
    }));
  },

  async togglePlugin(name, enabled) {
    await pluginsApi.toggle(name, enabled);
    set((state) => ({
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...state.plugins[name], enabled },
      },
    }));
  },

  async deletePlugin(name) {
    await pluginsApi.delete(name);
    await get().fetchPlugins();
  },
}));
