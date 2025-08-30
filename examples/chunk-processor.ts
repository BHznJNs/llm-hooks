export default {
  onUpstreamChunk: ({ data }) => {
    if (data.choices[0].delta.content) {
      return {
        ...data,
        choices: [
          {
            ...data.choices[0],
            delta: {
              ...data.choices[0].delta,
              content: `The assistant said: ${data.choices[0].delta.content}`,
            },
          },
        ],
      };
    }
    return data;
  },
};
