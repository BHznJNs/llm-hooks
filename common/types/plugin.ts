import type { Logger } from 'pino';

export type Plugin = {
  params?: Record<string, unknown>;

  beforeUpstreamRequest?: (request: Request) => Request | undefined;
  onUpstreamChunk?: (request: Request) => void;
  afterUpstreamResponse?: (response: Response) => Response | undefined;
  onFetchModelList?: (
    modelList: OpenAI.ModelListResponse,
    logger: Logger
  ) => OpenAI.ModelListResponse;
};
