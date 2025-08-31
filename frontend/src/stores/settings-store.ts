import { create } from 'zustand';

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
      // TODO: 这里应该调用 API 从后端获取设置
      // 目前只是模拟异步操作
      const SAVE_DELAY = 1000;
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY));

      // 模拟从后端获取的设置数据
      const mockSettings = {
        upstream: {
          baseUrl: 'https://api.openai.com/v1',
          provider: 'openai' as LlmProvider,
        },
        assistant: {
          baseUrl: 'https://api.openai.com/v1',
          provider: 'openai' as LlmProvider,
          model: 'gpt-4',
          apiKey: 'sk-123456',
        },
      };

      set({
        upstream: mockSettings.upstream,
        assistant: mockSettings.assistant,
        hasChanges: false,
        isLoading: false,
      });
    } catch (error) {
      // TODO: 后续应该使用更完善的错误处理机制
      set({ isLoading: false });
      throw error;
    }
  },

  saveSettings: async () => {
    set({ isSaving: true });

    try {
      // TODO: 这里应该调用 API 保存设置到后端
      // 目前只是模拟异步操作
      const SAVE_DELAY = 1000;
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY));

      set({ hasChanges: false, isSaving: false });
    } catch (error) {
      // TODO: 后续应该使用更完善的错误处理机制
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
