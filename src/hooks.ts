import type { SSEStreamingApi } from 'hono/streaming';
import type { Logger } from 'pino';
import type { AppConfig, PluginConfig } from '../common/types/config.ts';
import pluginConfigController from './controllers/plugin-config.ts';
import pluginInstanceController from './controllers/plugin-instance.ts';
import type { Plugin } from './types/plugin.ts';
import { AI_SDK_UTILS } from './utils/ai-sdk-utils.ts';
import { type LlmModel, llmClientFactory } from './utils/llm-client-factory.ts';
import { logger } from './utils/logger.ts';
import { responseStreamProcessor } from './utils/stream-utils.ts';

const moduleLogger = logger.moduleLogger('hooks');
type HookType = keyof AppConfig['plugins'];

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

async function hookWrapper(
  hookName: HookType,
  config: AppConfig,
  callback: (
    plugin: Plugin,
    pluginConfig: PluginConfig,
    utils: { logger: Logger; model: LlmModel }
  ) => Promise<unknown>
): Promise<void> {
  const assistantModel = assistantModelFactory(config);
  const pluginNames = config.plugins[hookName];
  const pluginConfigs = await pluginConfigController.loadBatch(pluginNames);
  for (const [pluginName, pluginConfig] of Object.entries(pluginConfigs)) {
    if (!pluginConfig.enabled) {
      continue;
    }
    const plugin = await pluginInstanceController.load(pluginName);
    if (plugin === null || !Object.hasOwn(plugin, hookName)) {
      continue;
    }

    try {
      await callback(plugin, pluginConfig, {
        logger: pluginLoggerFactory(hookName, pluginName),
        model: assistantModel,
      });
    } catch (error) {
      moduleLogger.error(
        `Plugin "${pluginName}" run error in hook "${hookName}": ${error}`
      );
    }
  }
}

// biome-ignore lint/complexity/noStaticOnlyClass: simulate a namespace with hooks handlers
export default class HooksHandler {
  static async onFetchModelList(
    config: AppConfig,
    modelListResponse: OpenAI.ModelListResponse
  ): Promise<OpenAI.ModelListResponse> {
    let finalResponse = modelListResponse;
    await hookWrapper(
      'onFetchModelList',
      config,
      async (plugin, pluginConfig, utils) => {
        const result = await plugin.onFetchModelList!({
          data: finalResponse,
          logger: utils.logger,
          model: utils.model,
          metadata: pluginConfig.params,
        });
        if (result !== null) {
          finalResponse = result;
        }
      }
    );
    return finalResponse;
  }

  static async beforeUpstreamRequest(
    config: AppConfig,
    chatCompletionRequest: OpenAI.ChatCompletionRequest
  ): Promise<{
    requestParams: OpenAI.ChatCompletionRequest;
    providerOptions: AI_SDK_UTILS.ProviderOptions;
  }> {
    let finalRequest = chatCompletionRequest;
    let providerOptions = AI_SDK_UTILS.extractOpenaiProviderOptions(
      chatCompletionRequest
    );
    await hookWrapper(
      'beforeUpstreamRequest',
      config,
      async (plugin, pluginConfig, utils) => {
        const hookResult = await plugin.beforeUpstreamRequest!({
          data: { requestParams: finalRequest, providerOptions },
          logger: utils.logger,
          model: utils.model,
          metadata: pluginConfig.params,
        });
        if (hookResult === null) {
          return;
        }
        finalRequest = hookResult.requestParams;
        if (hookResult.providerOptions !== undefined) {
          providerOptions =
            hookResult.providerOptions as AI_SDK_UTILS.ProviderOptions;
        }
      }
    );
    return {
      requestParams: finalRequest,
      providerOptions,
    };
  }

  static async onUpstreamChunk(
    config: AppConfig,
    chunk: OpenAI.ChatCompletionResponseChunk
  ): Promise<OpenAI.ChatCompletionResponseChunk | null> {
    let finalChunk = chunk;
    await hookWrapper(
      'onUpstreamChunk',
      config,
      async (plugin, pluginConfig, utils) => {
        const hookResult = await plugin.onUpstreamChunk!({
          data: finalChunk,
          logger: utils.logger,
          model: utils.model,
          metadata: pluginConfig.params,
        });
        if (hookResult !== null) {
          finalChunk = hookResult;
        }
      }
    );
    return finalChunk;
  }

  static async afterUpstreamResponse(
    config: AppConfig,
    response:
      | OpenAI.ChatCompletionResponse
      | { collectedResponse: string; stream: SSEStreamingApi },
    isStream: boolean
  ): Promise<OpenAI.ChatCompletionResponse | null> {
    if (!isStream) {
      let finalResponse = response as OpenAI.ChatCompletionResponse;
      await hookWrapper(
        'afterUpstreamResponse',
        config,
        async (plugin, pluginConfig, utils) => {
          const hookResult = await plugin.afterUpstreamResponse!(
            {
              data: finalResponse,
              logger: utils.logger,
              model: utils.model,
              metadata: pluginConfig.params,
            },
            isStream
          );
          if (hookResult !== null) {
            finalResponse = hookResult as OpenAI.ChatCompletionResponse;
          }
        }
      );
      return finalResponse;
    }

    const tempResponse = response as {
      collectedResponse: string;
      stream: SSEStreamingApi;
    };
    await hookWrapper(
      'afterUpstreamResponse',
      config,
      async (plugin, pluginConfig, utils) => {
        const hookResult = await plugin.afterUpstreamResponse!(
          {
            data: tempResponse.collectedResponse,
            logger: utils.logger,
            model: utils.model,
            metadata: pluginConfig.params,
          },
          isStream
        );
        if (hookResult === null) {
          return;
        }
        const processed = await responseStreamProcessor(
          config,
          hookResult as ReadableStream<
            | OpenAI.ChatCompletionResponseChunk
            | OpenAI.ChatCompletionResponseErrorChunk
          >,
          tempResponse.stream
        );
        if (processed?.collectedResponse) {
          tempResponse.collectedResponse = processed.collectedResponse;
        }
      }
    );
    return null;
  }
}
