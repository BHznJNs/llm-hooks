export default {
  beforeUpstreamRequest: ({ data }) => ({
    requestParams: {
      ...data.requestParams,
      model: 'replaced-model',
    },
  }),
};
