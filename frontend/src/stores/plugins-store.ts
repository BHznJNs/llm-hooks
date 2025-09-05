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

  fetchPlugins: async () => {
    set({ isLoading: true });
    const pluginData = await pluginsApi.getAll();
    set({ plugins: pluginData, isLoading: false });
  },

  createPlugin: async (name, newPluginConfig) => {
    const isExist = await pluginsApi.has(name);
    if (isExist) {
      throw new Error('Plugin already exists');
    }
    await pluginsApi.create({ name, ...newPluginConfig });
    await get().fetchPlugins();
  },

  updatePlugin: async (name, newConfig) => {
    await pluginsApi.update({ name, ...newConfig });
  },

  togglePlugin: async (name, enabled) => {
    await pluginsApi.toggle(name, enabled);
    set((state) => ({
      ...state,
      plugins: {
        ...state.plugins,
        [name]: { ...state.plugins[name], enabled },
      },
    }));
  },

  deletePlugin: async (name) => {
    await pluginsApi.delete(name);
    await get().fetchPlugins();
  },
}));
