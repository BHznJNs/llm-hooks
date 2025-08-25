import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core';
import type { PluginConfig } from '../../common/types/config.ts';
import type { LlmProvider } from '../llm-client-factory.ts';

const themeEnum = pgEnum('theme_enum', ['dark', 'light', 'system']);

export const appConfigs = pgTable('app_configs', {
  id: serial('id').primaryKey(),
  theme: themeEnum('theme').notNull(),
  language: text('language').notNull(),

  upstream: jsonb('upstream')
    .$type<{
      baseUrl: string;
      provider: LlmProvider;
    }>()
    .notNull(),

  assistant: jsonb('assistant')
    .$type<{
      baseUrl: string;
      provider: LlmProvider;
      model: string;
      apiKey: string;
    }>()
    .notNull(),

  plugins: jsonb('plugins')
    .$type<{
      beforeUpstreamRequest: Record<string, PluginConfig>;
      onUpstreamChunk: Record<string, PluginConfig>;
      afterUpstreamResponse: Record<string, PluginConfig>;
      onFetchModelList: Record<string, PluginConfig>;
    }>()
    .notNull(),
});

export const pluginConfigs = pgTable('plugin_configs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  dependencies: text('dependencies').array().notNull().default([]),
  params: jsonb('params').notNull().default({}),
});

export const pluginScripts = pgTable('plugin_scripts', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
});
