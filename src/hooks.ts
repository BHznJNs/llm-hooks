import type { SSEStreamingApi } from 'hono/streaming';
import type { Logger } from 'pino';
import type { AppConfig, PluginConfig } from '../common/types/config.ts';
import type { Plugin } from '../common/types/plugin.ts';
import { type LlmModel, llmClientFactory } from './llm-client-factory.ts';
import { loadPlugin } from './plugin.ts';
import { AI_SDK_UTILS } from './utils/ai-sdk-utils.ts';
import { logger } from './utils/logger.ts';
import { responseStreamProcessor } from './utils/stream-utils.ts';

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
      try {
        finalResponse = plugin.onFetchModelList!({
          data: finalResponse,
          logger: pluginLogger,
          model: assistantModel,
          config: pluginConfig.params,
        });
      } catch (error) {
        moduleLogger.error(`Plugin "${pluginName}" run error: ${error}`);
      }
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
        moduleLogger.error(`Plugin "${pluginName}" run error: ${error}`);
      }
    }
    return {
      requestParams: finalRequest,
      providerOptions,
    };
  }

  static async onUpstreamChunk(
    config: AppConfig,
    chunk: OpenAI.ChatCompletionResponseChunk
  ): Promise<OpenAI.ChatCompletionResponseChunk | null> {
    const assistantModel = assistantModelFactory(config);

    let finalChunk = chunk;
    for (const [pluginName, pluginConfig] of Object.entries(
      config.plugins.onUpstreamChunk
    )) {
      if (!pluginConfig.enabled) {
        continue;
      }
      const plugin = await loadPlugin(pluginName);
      if (plugin === null || !Object.hasOwn(plugin, 'onUpstreamChunk')) {
        continue;
      }
      const pluginLogger = pluginLoggerFactory('onUpstreamChunk', pluginName);
      try {
        const hookResult = plugin.onUpstreamChunk!({
          data: finalChunk,
          logger: pluginLogger,
          model: assistantModel,
          config: pluginConfig.params,
        });
        if (hookResult !== null) {
          finalChunk = hookResult;
        }
      } catch (error) {
        moduleLogger.error(`Plugin "${pluginName}" run error: ${error}`);
      }
    }
    return finalChunk;
  }

  static async afterUpstreamResponse(
    config: AppConfig,
    response:
      | OpenAI.ChatCompletionResponse
      | { collectedResponse: string; stream: SSEStreamingApi },
    isStream: boolean
  ): Promise<OpenAI.ChatCompletionResponse | null> {
    const assistantModel = assistantModelFactory(config);
    const plugins: [string, PluginConfig, Plugin][] = [];
    for (const [pluginName, pluginConfig] of Object.entries(
      config.plugins.afterUpstreamResponse
    )) {
      if (!pluginConfig.enabled) {
        continue;
      }
      const plugin = await loadPlugin(pluginName);
      if (plugin === null || !Object.hasOwn(plugin, 'afterUpstreamResponse')) {
        continue;
      }
      plugins.push([pluginName, pluginConfig, plugin]);
    }

    if (!isStream) {
      let finalResponse = response as OpenAI.ChatCompletionResponse;
      for (const [pluginName, pluginConfig, plugin] of plugins) {
        const hookResult = plugin.afterUpstreamResponse!(
          {
            data: finalResponse,
            logger: pluginLoggerFactory('afterUpstreamResponse', pluginName),
            model: assistantModel,
            config: pluginConfig.params,
          },
          isStream
        );
        if (hookResult !== null) {
          finalResponse = hookResult as OpenAI.ChatCompletionResponse;
        }
      }
      return finalResponse;
    }

    const tempResponse = response as {
      collectedResponse: string;
      stream: SSEStreamingApi;
    };
    for (const [pluginName, pluginConfig, plugin] of plugins) {
      const hookResult = plugin.afterUpstreamResponse!(
        {
          data: tempResponse.collectedResponse,
          logger: pluginLoggerFactory('afterUpstreamResponse', pluginName),
          model: assistantModel,
          config: pluginConfig.params,
        },
        isStream
      ) as ReadableStream<
        | OpenAI.ChatCompletionResponseChunk
        | OpenAI.ChatCompletionResponseErrorChunk
      >;
      const processed = await responseStreamProcessor(
        config,
        hookResult,
        tempResponse.stream
      );
      if (processed?.collectedResponse) {
        tempResponse.collectedResponse = processed.collectedResponse;
      }
    }
    return null;
  }
}
