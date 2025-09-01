import { create } from 'zustand';
import type { HookType } from '../../../common/types/hook';
import type { HooksData, HooksState } from '../types/hooks';

const initialHooksState: HooksState = {
  hooks: {
    beforeUpstreamRequest: [],
    onUpstreamChunk: [],
    afterUpstreamResponse: [],
    onFetchModelList: [],
  },
  pluginStates: {},
};

type HooksActions = {
  hasChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;
  loadingError: string | null;
  updateHookOrder: (hookType: HookType, newOrder: string[]) => void;

  fetchHooks: () => Promise<void>;
  saveChanges: () => Promise<void>;
};

export const useHooksStore = create<HooksState & HooksActions>((set, get) => ({
  ...initialHooksState,
  hasChanges: false,
  isSaving: false,
  isLoading: false,
  loadingError: null,

  updateHookOrder: (hookType, newOrder) => {
    set((state) => ({
      hasChanges: true,
      hooks: {
        ...state.hooks,
        [hookType]: newOrder,
      },
    }));
  },

  fetchHooks: async () => {
    set({ isLoading: true, loadingError: null });
    try {
      const response = await fetch('/api/hooks');
      if (!response.ok) {
        throw new Error('Failed to fetch hooks configuration');
      }
      const data = await response.json();

      if (!data) {
        set({
          hooks: initialHooksState.hooks,
          pluginStates: initialHooksState.pluginStates,
          isLoading: false,
        });
        return;
      }

      const { pluginOrder, pluginConfigs } = data as HooksData;
      const pluginStates: Record<string, boolean> = {};
      for (const [pluginName, pluginConfig] of Object.entries(pluginConfigs)) {
        pluginStates[pluginName] = pluginConfig.enabled;
      }

      set({
        hooks: pluginOrder,
        pluginStates,
        isLoading: false,
        hasChanges: false,
        loadingError: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        loadingError:
          error instanceof Error ? error.message : 'Unknown error occurred',
        hooks: initialHooksState.hooks,
        pluginStates: initialHooksState.pluginStates,
      });
    }
  },

  saveChanges: async () => {
    const state = get();
    if (!state.hasChanges) {
      return;
    }

    set({ isSaving: true, loadingError: null });
    try {
      const response = await fetch('/api/hooks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginOrder: state.hooks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save hooks configuration');
      }
      set({
        isSaving: false,
        hasChanges: false,
        loadingError: null,
      });
      await get().fetchHooks();
    } catch (error) {
      set({
        isSaving: false,
        loadingError:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },
}));
