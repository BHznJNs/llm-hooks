export type HookType =
  | 'beforeUpstreamRequest'
  | 'onUpstreamChunk'
  | 'afterUpstreamResponse'
  | 'onFetchModelList';

export type PluginItem = {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
};

export type HookConfig = {
  type: HookType;
  plugins: string[];
};

export type HooksState = {
  hooks: Record<HookType, string[]>;
  availablePlugins: PluginItem[];
  isLoading: boolean;
  hasChanges: boolean;
};
