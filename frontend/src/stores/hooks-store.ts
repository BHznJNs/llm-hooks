import { create } from 'zustand';
import type { HookType } from '../../../common/types/hook';
import { hooksApi } from '../api/hooks';

type HooksState = {
  hooks: Record<HookType, string[]>;
  pluginStates: Record<string, boolean>;
};

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
  updateHookOrder: (hookType: HookType, newOrder: string[]) => void;

  fetchHooks: () => Promise<void>;
  saveChanges: () => Promise<void>;
};

export const useHooksStore = create<HooksState & HooksActions>((set, get) => ({
  ...initialHooksState,
  hasChanges: false,
  isSaving: false,
  isLoading: false,

  updateHookOrder(hookType, newOrder) {
    set((state) => ({
      hasChanges: true,
      hooks: {
        ...state.hooks,
        [hookType]: newOrder,
      },
    }));
  },

  async fetchHooks() {
    set({ isLoading: true });
    const data = await hooksApi.fetchHooks();

    if (!data) {
      set({
        hooks: initialHooksState.hooks,
        pluginStates: initialHooksState.pluginStates,
        isLoading: false,
      });
      return;
    }

    const { pluginOrder, pluginConfigs } = data;
    const pluginStates: Record<string, boolean> = Object.create(null);
    for (const [pluginName, pluginConfig] of Object.entries(pluginConfigs)) {
      pluginStates[pluginName] = pluginConfig.enabled;
    }

    set({
      hooks: pluginOrder,
      pluginStates,
      isLoading: false,
      hasChanges: false,
    });
  },

  async saveChanges() {
    const state = get();
    if (!state.hasChanges) {
      return;
    }

    set({ isSaving: true });
    await hooksApi.updateHooks(state.hooks);
    await get().fetchHooks();
    set({
      isSaving: false,
      hasChanges: false,
    });
  },
}));
