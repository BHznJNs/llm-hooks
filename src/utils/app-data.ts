import envPaths from 'env-paths';

export default (() => {
  const paths = envPaths('llm-hooks');
  return paths.data;
})() as string;
