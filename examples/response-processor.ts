export default {
  afterUpstreamResponse: ({ data }, isStream: boolean) => {
    if (!isStream) {
      return {
        ...data,
        choices: [
          {
            ...data.choices[0],
            message: {
              ...data.choices[0].message,
              content: `The assistant said: \n ${data.choices[0].message.content}`,
            },
          },
        ],
      };
    }
    return new ReadableStream({
      start(controller) {
        controller.enqueue({
          id: 'chatcmpl-1234567890',
          object: 'chat.completion.chunk',
          created: 1_234_567_890,
          model: 'test',
          choices: [
            {
              index: 0,
              delta: { content: '\nAbove all, is what the model said.' },
              finish_reason: null,
            },
          ],
        });
        controller.close();
      },
    });
  },
};
