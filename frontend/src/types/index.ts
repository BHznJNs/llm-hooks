export type AppTheme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'zh';

export type AppState = {
  theme: AppTheme;
  language: Language;
};

export type HookType =
  | 'beforeUpstreamRequest'
  | 'onUpstreamChunk'
  | 'afterUpstreamResponse'
  | 'onFetchModelList';

export type PluginType = 'script' | 'npm';

export type BasePlugin = {
  id: string;
  name: string;
  enabled: boolean;
  hookType: HookType;
  type: PluginType;
  order: number;
};

export type ScriptPlugin = BasePlugin & {
  type: 'script';
  scriptType: 'typescript' | 'javascript';
  code: string;
};

export type NPMPlugin = BasePlugin & {
  type: 'npm';
  packageName: string;
  version?: string;
  entryPoint?: string;
};
