import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export default async function compile(
  tsFilePath: string
): Promise<string | null> {
  const sourceCode = await fs.readFile(tsFilePath, 'utf8');

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  };
  const result = ts.transpileModule(sourceCode, { compilerOptions });
  const jsCode = result.outputText;

  const jsFileName = `${path.basename(tsFilePath, '.ts')}.js`;
  const tsDirPath = path.dirname(tsFilePath);
  const compiledFilePath = path.join(tsDirPath, jsFileName);
  await fs.writeFile(compiledFilePath, jsCode);
  return compiledFilePath;
}
