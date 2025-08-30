CREATE TABLE "app_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"upstream" jsonb NOT NULL,
	"assistant" jsonb NOT NULL,
	"plugins" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"dependencies" text[],
	"params" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_scripts" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL
);
