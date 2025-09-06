import { boolean, jsonb, pgTable, serial, text } from 'drizzle-orm/pg-core';
import type { LlmProvider } from '../utils/llm-client-factory.ts';

export const appConfigs = pgTable('app_configs', {
  id: serial('id').primaryKey(),

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

  // defines the order of plugins for hooks
  plugins: jsonb('plugins')
    .$type<{
      beforeUpstreamRequest: string[];
      onUpstreamChunk: string[];
      afterUpstreamResponse: string[];
      onFetchModelList: string[];
    }>()
    .notNull(),
});

export const pluginConfigs = pgTable('plugin_configs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  enabled: boolean('enabled').notNull().default(true),
  params: jsonb('params').notNull().default({}),
});

export const pluginScripts = pgTable('plugin_scripts', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
});
