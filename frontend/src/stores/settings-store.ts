import { create } from 'zustand';
import { settingsApi } from '../api/settings.ts';

export type LlmProvider = 'openai' | 'google' | 'anthropic';

export type UpstreamConfig = {
  baseUrl: string;
  provider: LlmProvider;
};

export type AssistantConfig = {
  baseUrl: string;
  provider: LlmProvider;
  model: string;
  apiKey: string;
};

type SettingsState = {
  upstream: UpstreamConfig | null;
  assistant: AssistantConfig | null;
  hasChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  updateUpstream: (config: Partial<UpstreamConfig>) => void;
  updateAssistant: (config: Partial<AssistantConfig>) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  upstream: null,
  assistant: null,
  hasChanges: false,
  isSaving: false,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });

    try {
      const data = await settingsApi.getSettings();
      set({
        upstream: data.upstream,
        assistant: data.assistant,
        hasChanges: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  saveSettings: async () => {
    set({ isSaving: true });

    try {
      const { upstream, assistant } = useSettingsStore.getState();
      if (upstream && assistant) {
        await settingsApi.updateSettings({ upstream, assistant });
        set({ hasChanges: false, isSaving: false });
      }
    } catch (error) {
      set({ isSaving: false });
      throw error; // 重新抛出错误让调用方处理
    }
  },

  updateUpstream: (config) => {
    set((state) => ({
      upstream: { ...state.upstream!, ...config },
      hasChanges: true,
    }));
  },

  updateAssistant: (config) => {
    set((state) => ({
      assistant: { ...state.assistant!, ...config },
      hasChanges: true,
    }));
  },
}));
