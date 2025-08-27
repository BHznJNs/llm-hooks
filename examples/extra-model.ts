export default {
  beforeUpstreamRequest: ({ data: modelListResponse }) => ({
    data: [
      ...modelListResponse.data,
      {
        id: 'model-router',
        object: 'model',
        created: 1_234_567_890,
        owned_by: 'llm-hooks',
      },
    ],
  }),
};
