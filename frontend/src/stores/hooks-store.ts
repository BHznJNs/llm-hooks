import { create } from 'zustand';
import type { HooksState, HookType, PluginItem } from '../types/hooks';

const SAVE_TIMEOUT = 1000;

type HooksActions = {
  updateHookOrder: (hookType: HookType, newOrder: string[]) => void;
  setLoading: (loading: boolean) => void;
  markChanged: () => void;
  saveChanges: () => Promise<void>;
  resetChanges: () => void;
  setAvailablePlugins: (plugins: PluginItem[]) => void;
};

const initialHooksState: Omit<HooksState, 'availablePlugins'> = {
  hooks: {
    beforeUpstreamRequest: [],
    onUpstreamChunk: [],
    afterUpstreamResponse: [],
    onFetchModelList: [],
  },
  isLoading: false,
  hasChanges: false,
};

// Mock data for development
const mockPlugins: PluginItem[] = [
  {
    id: 'plugin-1',
    name: 'Logger Plugin',
    description: 'Logs requests and responses',
    enabled: true,
  },
  {
    id: 'plugin-2',
    name: 'Rate Limiter',
    description: 'Controls request rate',
    enabled: true,
  },
  {
    id: 'plugin-3',
    name: 'Cache Plugin',
    description: 'Caches responses for better performance',
    enabled: false,
  },
  {
    id: 'plugin-4',
    name: 'Auth Validator',
    description: 'Validates authentication tokens',
    enabled: true,
  },
];

export const useHooksStore = create<HooksState & HooksActions>((set) => ({
  ...initialHooksState,
  availablePlugins: mockPlugins,

  updateHookOrder: (hookType, newOrder) => {
    set((state) => ({
      hooks: {
        ...state.hooks,
        [hookType]: newOrder,
      },
      hasChanges: true,
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  markChanged: () => {
    set({ hasChanges: true });
  },

  saveChanges: async () => {
    set({ isLoading: true });

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, SAVE_TIMEOUT));

      set({ hasChanges: false });
    } catch {
      // TODO: Add proper error handling
    } finally {
      set({ isLoading: false });
    }
  },

  resetChanges: () => {
    set({ hasChanges: false });
  },

  setAvailablePlugins: (plugins) => {
    set({ availablePlugins: plugins });
  },
}));
