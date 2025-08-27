import type { Logger } from 'pino';
import type { AppConfig } from '../common/types/config.ts';
import { type LlmModel, llmClientFactory } from './llm-client-factory.ts';
import { loadPlugin } from './plugin.ts';
import { AI_SDK_UTILS } from './utils/ai-sdk-utils.ts';
import { logger } from './utils/logger.ts';

const moduleLogger = logger.moduleLogger('hooks');

function assistantModelFactory(config: AppConfig): LlmModel {
  const client = llmClientFactory(
    config.assistant.provider,
    config.assistant.apiKey,
    config.assistant.baseUrl
  );
  return client.chat(config.assistant.model);
}

function pluginLoggerFactory(hookName: string, pluginName: string): Logger {
  return logger.moduleLogger(`hook: ${hookName} | plugin:${pluginName}`);
}

// biome-ignore lint/complexity/noStaticOnlyClass: simulate a namespace with hooks handlers
export default class HooksHandler {
  static async onFetchModelList(
    config: AppConfig,
    modelListResponse: OpenAI.ModelListResponse
  ): Promise<OpenAI.ModelListResponse> {
    const assistantModel = assistantModelFactory(config);

    let finalResponse = modelListResponse;
    for (const [pluginName, pluginConfig] of Object.entries(
      config.plugins.onFetchModelList
    )) {
      if (!pluginConfig.enabled) {
        continue;
      }
      const plugin = await loadPlugin(pluginName);
      if (plugin === null || !Object.hasOwn(plugin, 'onFetchModelList')) {
        continue;
      }
      const pluginLogger = pluginLoggerFactory('onFetchModelList', pluginName);
      finalResponse = plugin.onFetchModelList!({
        data: finalResponse,
        logger: pluginLogger,
        model: assistantModel,
        config: pluginConfig.params,
      });
    }
    return finalResponse;
  }

  static async beforeUpstreamRequest(
    config: AppConfig,
    chatCompletionRequest: OpenAI.ChatCompletionRequest
  ): Promise<{
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions: AI_SDK_UTILS.ProviderOptions;
  }> {
    const assistantModel = assistantModelFactory(config);

    let finalRequest = chatCompletionRequest;
    let providerOptions = AI_SDK_UTILS.extractOpenaiProviderOptions(
      chatCompletionRequest
    );
    for (const [pluginName, pluginConfig] of Object.entries(
      config.plugins.beforeUpstreamRequest
    )) {
      if (!pluginConfig.enabled) {
        continue;
      }
      const plugin = await loadPlugin(pluginName);
      if (plugin === null || !Object.hasOwn(plugin, 'beforeUpstreamRequest')) {
        continue;
      }
      const pluginLogger = pluginLoggerFactory(
        'beforeUpstreamRequest',
        pluginName
      );
      try {
        const hookResult = plugin.beforeUpstreamRequest!({
          data: { requestParams: finalRequest, providerOptions },
          logger: pluginLogger,
          model: assistantModel,
          config: pluginConfig.params,
        });
        finalRequest = hookResult.requestParams;
        if (hookResult.providerOptions !== undefined) {
          providerOptions =
            hookResult.providerOptions as AI_SDK_UTILS.ProviderOptions;
        }
      } catch (error) {
        moduleLogger.error(`Plugin "${pluginName}" run failed: ${error}`);
      }
    }
    return {
      requestParams: finalRequest,
      providerOptions,
    };
  }
}
