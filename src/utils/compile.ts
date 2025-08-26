import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { logger } from './logger.ts';

const moduleLogger = logger.moduleLogger('compile');

export default async function (tsFilePath: string): Promise<string | null> {
  const sourceCode = await fs.readFile(tsFilePath, 'utf8');

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  };
  let compiledCode: string | null = null;
  try {
    const result = ts.transpileModule(sourceCode, { compilerOptions });
    compiledCode = result.outputText;
  } catch (error) {
    moduleLogger.error(`Failed to compile plugin: ${error}`);
    return null;
  }

  const jsFileName = `${path.basename(tsFilePath, '.ts')}.js`;
  const targetDir = path.dirname(tsFilePath);
  const compiledFilePath = path.join(targetDir, jsFileName);
  try {
    await fs.writeFile(compiledFilePath, compiledCode);
  } catch {
    moduleLogger.error(`Failed to write compiled file: ${compiledFilePath}`);
    return null;
  }
  return compiledFilePath;
}
