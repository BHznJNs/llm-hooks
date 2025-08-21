import type { OpenAIModelListResponse } from './openai.js';

declare type Plugin = {
  name: string;
  dependencies: string[];

  beforeUpstreamRequest?: (request: Request) => Request | undefined;
  onUpstreamChunk?: (request: Request) => void;
  afterUpstreamResponse?: (response: Response) => Response | undefined;
  onFetchModelList?: (
    modelList: OpenAIModelListResponse
  ) => OpenAIModelListResponse;
};
