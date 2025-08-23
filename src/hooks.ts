import type { AppConfig } from '../common/types/config.ts';
import loadPlugin from './load-plugin.ts';

// biome-ignore lint/complexity/noStaticOnlyClass: simulate a namespace with hooks handlers
export default class HooksHandler {
  static async onFetchModelList(
    config: AppConfig,
    modelListResponse: OpenAI.ModelListResponse
  ): Promise<OpenAI.ModelListResponse> {
    let finalResponse = modelListResponse;
    for (const pluginConfig of config.plugins) {
      if (!pluginConfig.enabled) {
        continue;
      }
      const plugin = await loadPlugin(pluginConfig.name);
      if (plugin?.onFetchModelList) {
        finalResponse = plugin.onFetchModelList(finalResponse);
      }
    }
    return finalResponse;
  }
}
