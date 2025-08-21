export function loadConfig() {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  };
}
