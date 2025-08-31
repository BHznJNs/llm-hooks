export type PluginMetadata = {
  [key: string]: string;
};

export type Plugin = {
  name: string;
  enabled: boolean;
  content: string;
  metadata: PluginMetadata;
};
