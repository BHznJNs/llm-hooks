import type { AppConfig } from '../../../common/types/config.ts';

export type HookType = keyof AppConfig['plugins'];

export type HooksState = {
  hooks: Record<HookType, string[]>;
  pluginStates: Record<string, boolean>;
};
