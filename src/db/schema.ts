import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// LLM Provider Enumeration
export const llmProviderEnum = pgEnum('llm_provider', [
  'openai',
  'google',
  'anthropic',
]);

export const appConfigs = pgTable('app_configs', {
  id: serial('id').primaryKey(),
  theme: text('theme').notNull(),
  language: text('language').notNull(),

  // upstream config
  upstreamBaseUrl: text('upstream_base_url').notNull(),
  upstreamProvider: text('upstream_provider').notNull(),

  // assistant config
  assistantBaseUrl: text('assistant_base_url'),
  assistantProvider: text('assistant_provider'),
  assistantModel: text('assistant_model').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const pluginConfigs = pgTable('plugin_configs', {
  id: serial('id').primaryKey(),
  appConfigId: integer('app_config_id')
    .notNull()
    .references(() => appConfigs.id),
  name: text('name').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  dependencies: text('dependencies').array().notNull().default([]),
  arguments: jsonb('arguments').notNull().default({}),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appConfigRelations = relations(appConfigs, ({ many }) => ({
  plugins: many(pluginConfigs),
}));

export const pluginConfigRelations = relations(pluginConfigs, ({ one }) => ({
  appConfig: one(appConfigs, {
    fields: [pluginConfigs.appConfigId],
    references: [appConfigs.id],
  }),
}));
