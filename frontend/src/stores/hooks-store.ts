import { create } from 'zustand';
import type { HooksState, HookType } from '../types/hooks';

const initialHooksState: HooksState = {
  hooks: {
    beforeUpstreamRequest: ['replace-model', 'extra-model'],
    onUpstreamChunk: [],
    afterUpstreamResponse: [],
    onFetchModelList: [],
  },
  pluginStates: {
    'replace-model': true,
    'extra-model': false,
  },
};

type HooksActions = {
  hasChanges: boolean;
  isSaving: boolean;
  saveChanges: () => Promise<void>;
  updateHookOrder: (hookType: HookType, newOrder: string[]) => void;
  setPluginStates: (plugins: Record<string, boolean>) => void;
};

export const useHooksStore = create<HooksState & HooksActions>((set) => ({
  ...initialHooksState,
  hasChanges: false,
  isSaving: false,

  saveChanges: async () => {
    set((_state) => ({
      isSaving: true,
      hasChanges: false,
    }));
    // TODO: Call save API
    await fetch('/api/...');
    set((_state) => ({
      isSaving: false,
    }));
  },

  updateHookOrder: (hookType, newOrder) => {
    set((state) => ({
      hasChanges: true,
      hooks: {
        ...state.hooks,
        [hookType]: newOrder,
      },
    }));
  },

  setPluginStates: (plugins) => {
    set({ pluginStates: plugins });
  },
}));
