import type { PluginConfig } from '../../../common/types/config.ts';
import type { HookType } from '../../../common/types/hook.ts';

export type HooksState = {
  hooks: Record<HookType, string[]>;
  pluginStates: Record<string, boolean>;
};

export type HooksData = {
  pluginOrder: Record<HookType, string[]>;
  pluginConfigs: Record<string, PluginConfig>;
};
