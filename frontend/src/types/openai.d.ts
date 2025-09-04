/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: <explanation> */
/** biome-ignore-all lint/complexity/noBannedTypes: <explanation> */
/** biome-ignore-all lint/style/noNamespace: <explanation> */
/** biome-ignore-all lint/style/useConsistentArrayType: <explanation> */

/**
 * 聊天完成响应
 */
interface ChatCompletion {
  /**
   * 聊天完成的唯一标识符
   */
  id: string;

  /**
   * 聊天完成选择的列表
   */
  choices: Array<ChatCompletion.Choice>;

  /**
   * 聊天完成创建的 Unix 时间戳（秒）
   */
  created: number;

  /**
   * 用于聊天完成的模型
   */
  model: string;

  /**
   * 对象类型，始终为 `chat.completion`
   */
  object: 'chat.completion';

  /**
   * 请求处理的服务层类型
   */
  service_tier?: 'auto' | 'default' | 'flex' | 'scale' | 'priority' | null;

  /**
   * 表示模型运行的后端配置
   */
  system_fingerprint?: string;

  /**
   * 完成请求的用法统计
   */
  usage?: CompletionUsage;
}

namespace ChatCompletion {
  export interface Choice {
    /**
     * 模型停止生成 token 的原因
     */
    finish_reason:
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call';

    /**
     * 选择列表中选择的索引
     */
    index: number;

    /**
     * 选择的日志概率信息
     */
    logprobs: Choice.Logprobs | null;

    /**
     * 模型生成的聊天完成消息
     */
    message: ChatCompletionMessage;
  }

  export namespace Choice {
    export interface Logprobs {
      /**
       * 消息内容 token 的日志概率信息列表
       */
      content: Array<ChatCompletionTokenLogprob> | null;

      /**
       * 消息拒绝 token 的日志概率信息列表
       */
      refusal: Array<ChatCompletionTokenLogprob> | null;
    }
  }
}

/**
 * 表示聊天完成响应的流式块
 */
interface ChatCompletionChunk {
  /**
   * 聊天完成的唯一标识符，每个块具有相同的 ID
   */
  id: string;

  /**
   * 聊天完成选择的列表
   */
  choices: Array<ChatCompletionChunk.Choice>;

  /**
   * 聊天完成创建时的 Unix 时间戳（秒）
   */
  created: number;

  /**
   * 用于生成完成的模型
   */
  model: string;

  /**
   * 对象类型，始终为 `chat.completion.chunk`
   */
  object: 'chat.completion.chunk';

  /**
   * 请求处理的服务层类型
   */
  service_tier?: 'auto' | 'default' | 'flex' | 'scale' | 'priority' | null;

  /**
   * 表示模型运行的后端配置
   */
  system_fingerprint?: string;

  /**
   * 当设置了 `stream_options: {"include_usage": true}` 时的可选用法统计字段
   */
  usage?: CompletionUsage | null;
}

namespace ChatCompletionChunk {
  export interface Choice {
    /**
     * 由流式模型响应生成的聊天完成 delta
     */
    delta: Choice.Delta;

    /**
     * 模型停止生成 token 的原因
     */
    finish_reason:
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call'
      | null;

    /**
     * 选择列表中选择的索引
     */
    index: number;

    /**
     * 选择的日志概率信息
     */
    logprobs?: Choice.Logprobs | null;
  }

  export namespace Choice {
    export interface Delta {
      /**
       * 块消息的内容
       */
      content?: string | null;

      /**
       * 应由调用的函数的名称和参数
       */
      function_call?: Delta.FunctionCall;

      /**
       * 模型生成的拒绝消息
       */
      refusal?: string | null;

      /**
       * 此消息作者的角色
       */
      role?: 'developer' | 'system' | 'user' | 'assistant' | 'tool';

      /**
       * 模型生成的工具调用
       */
      tool_calls?: Array<Delta.ToolCall>;
    }

    export namespace Delta {
      export interface FunctionCall {
        /**
         * 调用函数的参数，由模型以 JSON 格式生成
         */
        arguments?: string;
        /**
         * 要调用的函数名称
         */
        name?: string;
      }

      export interface ToolCall {
        index: number;
        /**
         * 工具调用的 ID
         */
        id?: string;
        function?: ToolCall.Function;
        /**
         * 工具的类型
         */
        type?: 'function';
      }

      export namespace ToolCall {
        export interface Function {
          /**
           * 调用函数的参数，由模型以 JSON 格式生成
           */
          arguments?: string;
          /**
           * 要调用的函数名称
           */
          name?: string;
        }
      }
    }

    export interface Logprobs {
      /**
       * 消息内容 token 的日志概率信息列表
       */
      content: Array<ChatCompletionTokenLogprob> | null;
      /**
       * 消息拒绝 token 的日志概率信息列表
       */
      refusal: Array<ChatCompletionTokenLogprob> | null;
    }
  }
}

/**
 * 聊天完成参数的非流式变体
 */
interface ChatCompletionCreateParamsNonStreaming
  extends ChatCompletionCreateParamsBase {
  stream?: false | null;
}

/**
 * 聊天完成参数的流式变体
 */
interface ChatCompletionCreateParamsStreaming
  extends ChatCompletionCreateParamsBase {
  stream: true;
}

/**
 * 聊天完成创建参数
 */
type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;

/**
 * 聊天完成创建的基础参数
 */
interface ChatCompletionCreateParamsBase {
  /**
   * 至此对话的消息列表
   */
  messages: Array<ChatCompletionMessageParam>;

  /**
   * 用于生成响应的模型 ID
   */
  model: (string & {}) | ChatModel;

  /**
   * 音频输出的参数
   */
  audio?: ChatCompletionAudioParam | null;

  /**
   * -2.0 到 2.0 之间的数字。正值会根据文本现有频率惩罚新 token
   */
  frequency_penalty?: number | null;

  /**
   * 修改指定 token 出现在完成中的可能性
   */
  logit_bias?: { [key: string]: number } | null;

  /**
   * 是否返回输出 token 的日志概率
   */
  logprobs?: boolean | null;

  /**
   * 可以为完成生成的 token 数量的上限
   */
  max_completion_tokens?: number | null;

  /**
   * 最大 token 数（已弃用）
   */
  max_tokens?: number | null;

  /**
   * 对象元数据
   */
  metadata?: { [key: string]: string } | null;

  /**
   * 要生成的输出类型
   */
  modalities?: Array<'text' | 'audio'> | null;

  /**
   * 为每个输入消息生成的聊天完成选择数
   */
  n?: number | null;

  /**
   * 是否启用函数调用的并行工具调用
   */
  parallel_tool_calls?: boolean;

  /**
   * 静态预测输出内容
   */
  prediction?: ChatCompletionPredictionContent | null;

  /**
   * -2.0 到 2.0 之间的数字。正值会根据文本中是否出现来惩罚新 token
   */
  presence_penalty?: number | null;

  /**
   * 推理努力程度
   */
  reasoning_effort?: ReasoningEffort | null;

  /**
   * 模型必须输出的格式
   */
  response_format?:
    | ResponseFormatText
    | ResponseFormatJSONSchema
    | ResponseFormatJSONObject
    | null;

  /**
   * 用于确定性采样的种子
   */
  seed?: number | null;

  /**
   * 处理请求的服务层
   */
  service_tier?: 'auto' | 'default' | 'flex' | 'scale' | 'priority' | null;

  /**
   * API 停止生成进一步 token 的序列
   */
  stop?: string | null | Array<string>;

  /**
   * 是否存储此聊天完成请求的输入
   */
  store?: boolean | null;

  /**
   * 是否将模型响应数据流式传输给客户端
   */
  stream?: boolean | null;

  /**
   * 流式响应的选项
   */
  stream_options?: ChatCompletionStreamOptions | null;

  /**
   * 使用的采样温度
   */
  temperature?: number | null;

  /**
   * 控制模型调用哪个（如果有）工具
   */
  tool_choice?: ChatCompletionToolChoiceOption;

  /**
   * 模型可以调用的工具列表
   */
  tools?: Array<ChatCompletionTool>;

  /**
   * 最可能返回的 token 数量
   */
  top_logprobs?: number | null;

  /**
   * 核心采样选项
   */
  top_p?: number | null;

  /**
   * 最终用户的唯一标识符
   */
  user?: string;
}

/**
 * 消息参数的类型联合
 */
type ChatCompletionMessageParam =
  | ChatCompletionDeveloperMessageParam
  | ChatCompletionSystemMessageParam
  | ChatCompletionUserMessageParam
  | ChatCompletionAssistantMessageParam
  | ChatCompletionToolMessageParam;

/**
 * 开发者消息参数
 */
interface ChatCompletionDeveloperMessageParam {
  content: string | Array<ChatCompletionContentPartText>;
  role: 'developer';
  name?: string;
}

/**
 * 系统消息参数
 */
interface ChatCompletionSystemMessageParam {
  content: string | Array<ChatCompletionContentPartText>;
  role: 'system';
  name?: string;
}

/**
 * 用户消息参数
 */
interface ChatCompletionUserMessageParam {
  content: string | Array<ChatCompletionContentPart>;
  role: 'user';
  name?: string;
}

/**
 * 助手消息参数
 */
interface ChatCompletionAssistantMessageParam {
  role: 'assistant';
  content?:
    | string
    | Array<ChatCompletionContentPartText | ChatCompletionContentPartRefusal>
    | null;
  name?: string;
  refusal?: string | null;
  tool_calls?: Array<ChatCompletionMessageToolCall>;
}

/**
 * 工具消息参数
 */
interface ChatCompletionToolMessageParam {
  content: string | Array<ChatCompletionContentPartText>;
  role: 'tool';
  tool_call_id: string;
}

/**
 * 聊天内容部分
 */
type ChatCompletionContentPart =
  | ChatCompletionContentPartText
  | ChatCompletionContentPartImage
  | ChatCompletionContentPartInputAudio;

/**
 * 文本内容部分
 */
interface ChatCompletionContentPartText {
  text: string;
  type: 'text';
}

/**
 * 图片内容部分
 */
interface ChatCompletionContentPartImage {
  image_url: ChatCompletionContentPartImage.ImageURL;
  type: 'image_url';
}

namespace ChatCompletionContentPartImage {
  export interface ImageURL {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  }
}

/**
 * 音频输入内容部分
 */
interface ChatCompletionContentPartInputAudio {
  input_audio: ChatCompletionContentPartInputAudio.InputAudio;
  type: 'input_audio';
}

namespace ChatCompletionContentPartInputAudio {
  export interface InputAudio {
    data: string;
    format: 'wav' | 'mp3';
  }
}

/**
 * 拒绝内容部分
 */
interface ChatCompletionContentPartRefusal {
  refusal: string;
  type: 'refusal';
}

/**
 * 消息工具调用
 */
type ChatCompletionMessageToolCall = ChatCompletionMessageFunctionToolCall;

/**
 * 函数工具调用
 */
interface ChatCompletionMessageFunctionToolCall {
  id: string;
  function: ChatCompletionMessageFunctionToolCall.Function;
  type: 'function';
}

namespace ChatCompletionMessageFunctionToolCall {
  export interface Function {
    arguments: string;
    name: string;
  }
}

/**
 * 聊天完成工具
 */
type ChatCompletionTool = ChatCompletionFunctionTool;

/**
 * 函数工具
 */
interface ChatCompletionFunctionTool {
  function: FunctionDefinition;
  type: 'function';
}

/**
 * 函数定义
 */
interface FunctionDefinition {
  /**
   * 要调用的函数名称
   */
  name: string;

  /**
   * 函数功能的描述
   */
  description?: string;

  /**
   * 函数接受的参数，描述为 JSON Schema 对象
   */
  parameters?: { [key: string]: unknown };

  /**
   * 是否启用严格模式架构
   */
  strict?: boolean | null;
}

/**
 * 工具选择选项
 */
type ChatCompletionToolChoiceOption =
  | 'none'
  | 'auto'
  | 'required'
  | ChatCompletionNamedToolChoice;

/**
 * 命名工具选择
 */
interface ChatCompletionNamedToolChoice {
  function: ChatCompletionNamedToolChoice.Function;
  type: 'function';
}

namespace ChatCompletionNamedToolChoice {
  export interface Function {
    name: string;
  }
}

/**
 * 预测内容
 */
interface ChatCompletionPredictionContent {
  content: string | Array<ChatCompletionContentPartText>;
  type: 'content';
}

/**
 * 流式响应选项
 */
interface ChatCompletionStreamOptions {
  include_usage?: boolean;
}

/**
 * 音频参数
 */
interface ChatCompletionAudioParam {
  format: 'wav' | 'aac' | 'mp3' | 'flac' | 'opus' | 'pcm16';
  voice: string;
}

/**
 * Token 日志概率
 */
interface ChatCompletionTokenLogprob {
  token: string;
  bytes: Array<number> | null;
  logprob: number;
  top_logprobs: Array<ChatCompletionTokenLogprob.TopLogprob>;
}

namespace ChatCompletionTokenLogprob {
  export interface TopLogprob {
    token: string;
    bytes: Array<number> | null;
    logprob: number;
  }
}

/**
 * 模型
 */
interface Model_ {
  id: string;
  created: number;
  object: 'model';
  owned_by: string;
}

/**
 * 完成用法
 */
interface CompletionUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
}

/**
 * 聊天完成模型
 */
type ChatModel = string;

/**
 * 文本响应格式
 */
interface ResponseFormatText {
  type: 'text';
}

/**
 * JSON 对象响应格式
 */
interface ResponseFormatJSONObject {
  type: 'json_object';
}

/**
 * JSON Schema 响应格式
 */
interface ResponseFormatJSONSchema {
  json_schema: ResponseFormatJSONSchema.JSONSchema;
  type: 'json_schema';
}

namespace ResponseFormatJSONSchema {
  export interface JSONSchema {
    name: string;
    description?: string;
    schema?: { [key: string]: unknown };
    strict?: boolean | null;
  }
}

type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high' | null;

/**
 * 错误块
 */
type ErrorChunk = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: [
    {
      index: 0;
      delta: {};
      finish_reason: 'stop';
    },
  ];
  error: {
    message: string;
    type: string;
  };
};

/**
 * 聊天完成消息
 */
interface ChatCompletionMessage {
  content: string | null;
  refusal: string | null;
  role: 'assistant';
  audio?: {
    id: string;
    data: string;
    expires_at: number;
    transcript: string;
  } | null;
  tool_calls?: Array<ChatCompletionMessageToolCall>;
}

export namespace OpenAI {
  export type ChatCompletionRequest = ChatCompletionCreateParams;
  export type ChatCompletionResponse = ChatCompletion;
  export type ChatCompletionResponseChunk = ChatCompletionChunk;
  export type ChatCompletionResponseErrorChunk = ErrorChunk;
  export type ChatCompletionTool = ChatCompletionFunctionTool;
  export type ChatCompletionResponseToolCall = ChatCompletionMessageToolCall;
  export type ChatCompletionFinishReason =
    | 'stop'
    | 'length'
    | 'tool_calls'
    | 'content_filter'
    | 'function_call'
    | null;

  export type Model = Model_;
  export type ModelListResponse = {
    data: Model[];
  };
}
