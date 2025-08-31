import { create } from 'zustand';
import type { Plugin } from '../types/plugin';

// 模拟的插件数据
const mockPlugins: Plugin[] = [
  {
    name: 'example-script-plugin',
    enabled: true,
    content: 'console.log("Hello from script plugin!");',
    metadata: {
      type: 'script',
      language: 'typescript',
    },
  },
  {
    name: 'another-npm-plugin',
    enabled: false,
    content: '',
    metadata: {
      type: 'npm',
      packageName: '@example/plugin',
      version: '1.0.0',
    },
  },
];

export type PluginsState = {
  plugins: Plugin[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPlugins: () => Promise<void>;
  createPlugin: (
    plugin: Omit<Plugin, 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updatePlugin: (name: string, updates: Partial<Plugin>) => Promise<void>;
  deletePlugin: (name: string) => Promise<void>;
  togglePluginEnabled: (name: string) => Promise<void>;
};

export const usePluginsStore = create<PluginsState>((set) => ({
  plugins: [],
  loading: false,
  error: null,

  fetchPlugins: async () => {
    const API_CALL_DELAY = 500;
    set({ loading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, API_CALL_DELAY));
      set({ plugins: mockPlugins, loading: false });
    } catch {
      set({ error: 'Failed to fetch plugins', loading: false });
    }
  },

  createPlugin: async (plugin) => {
    await fetch('/api/plugins');
    set((state) => ({
      plugins: [
        ...state.plugins,
        {
          ...plugin,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Plugin,
      ],
    }));
  },

  updatePlugin: async (name, updates) => {
    await fetch('/api/plugins');
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.name === name ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    }));
  },

  deletePlugin: async (name) => {
    await fetch('/api/plugins');
    set((state) => ({
      plugins: state.plugins.filter((p) => p.name !== name),
    }));
  },

  togglePluginEnabled: async (name) => {
    await fetch('/api/plugins');
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.name === name ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  },
}));
