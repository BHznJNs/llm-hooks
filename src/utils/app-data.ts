// export async function getAppData(): Promise<string> {
//   const { default: envPaths } = await import('env-paths');
//   const paths = envPaths('llm-hooks');
//   return paths.data;
// }
const appData: Promise<string> = (async () => {
  const { default: envPaths } = await import('env-paths');
  const paths = envPaths('llm-hooks');
  return paths.data;
})();
export default appData;
