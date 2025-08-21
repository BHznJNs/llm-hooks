export type ChatCompletionRequest = {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | null;
    name?: string;
    tool_call_id?: string;
  }>;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  logprobs?: boolean;
  top_logprobs?: number;
  max_tokens?: number;
  n?: number;
  presence_penalty?: number;
  response_format?: {
    type: 'text' | 'json_object';
  };
  seed?: number;
  stop?: string | string[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  tool_choice?:
    | 'none'
    | 'auto'
    | {
        type: 'function';
        function: {
          name: string;
        };
      };
  user?: string;
};

export type OpenAIModelListResponse = {
  data: {
    id: string;
    object: string;
    created: number;
    owned_by: string;
    supported_endpoint_types: string[];
  }[];
};
