import { Editor } from '@monaco-editor/react';
import {
  editor as MonacoEditor,
  type languages as MonacoLanguages,
} from 'monaco-editor';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/language-store';
import { useThemeStore } from '../../stores/theme-store';
// biome-ignore lint/suspicious/noTsIgnore: <explanation>
// @ts-ignore
import AI_SDK_TYPE_DEFINITIONS from '../../types/ai-sdk.d.ts?raw';
// biome-ignore lint/suspicious/noTsIgnore: <explanation>
// @ts-ignore
import OPENAI_TYPE_DEFINITIONS from '../../types/openai.d.ts?raw';
// biome-ignore lint/suspicious/noTsIgnore: <explanation>
// @ts-ignore
import PLUGIN_TYPE_DEFINITIONS from '../../types/plugin.d.ts?raw';

export type ScriptEditorHandle = {
  getValue: () => string | undefined;
  setValue: (value: string) => void;
};
type ScriptEditorProps = {
  scriptType: 'javascript' | 'typescript';
};

const SDK_TYPE_DEF = `\
declare module 'llm-hooks-sdk' {
${AI_SDK_TYPE_DEFINITIONS}

${OPENAI_TYPE_DEFINITIONS}

${PLUGIN_TYPE_DEFINITIONS}
}`;

const DEFAULT_JAVASCRIPT_PLUGIN_CONTENT = `\
import { Plugin } from 'llm-hooks-sdk';

/**
 * @type {Plugin}
 */
const plugin = {

};
export default plugin;`;

const DEFAULT_TYPESCRIPT_PLUGIN_CONTENT = `\
import type { Plugin } from 'llm-hooks-sdk';

export default {
    
} satisfies Plugin;`;

export const ScriptEditor = forwardRef<ScriptEditorHandle, ScriptEditorProps>(
  ({ scriptType }, ref) => {
    const { language } = useLanguageStore();
    const { t } = useTranslation(language);
    const { theme } = useThemeStore();
    const [editorInitialValue, setEditorInitialValue] = useState(
      getDefaultContent(scriptType)
    );
    const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getValue() {
        return editorRef.current?.getValue();
      },
      setValue(value: string) {
        setEditorInitialValue(value);
        editorRef.current?.setValue(value);
      },
    }));

    useEffect(() => {
      MonacoEditor.setTheme(theme === 'dark' ? 'vs-dark' : 'light');
    }, [theme]);

    function handleEditorBeforeMount(monaco: {
      languages: typeof MonacoLanguages;
    }) {
      const jsDocToTypeHintId = 80_004;
      monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        SDK_TYPE_DEF,
        'file:///node_modules/plugin/index.d.ts'
      );
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        SDK_TYPE_DEF,
        'file:///node_modules/plugin/index.d.ts'
      );
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs, // ← 解决 2792
        allowSyntheticDefaultImports: true,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        checkJs: true,
        allowJs: true,
        esModuleInterop: true,
        strict: true,
      });
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [jsDocToTypeHintId],
      });
    }

    function handleEditorDidMount(editor: MonacoEditor.IStandaloneCodeEditor) {
      editorRef.current = editor;
    }

    function getDefaultContent(type: 'javascript' | 'typescript') {
      return type === 'javascript'
        ? DEFAULT_JAVASCRIPT_PLUGIN_CONTENT
        : DEFAULT_TYPESCRIPT_PLUGIN_CONTENT;
    }

    return (
      <div
        ref={editorContainerRef}
        className="flex flex-1 flex-col rounded-md border border-gray-300 dark:border-gray-700"
      >
        <div className="flex items-center justify-between border-gray-300 border-b p-2 dark:border-gray-700">
          <div className="font-medium text-gray-700 text-sm dark:text-gray-300">
            {t('code-editor')}
          </div>
        </div>
        <Editor
          height="50vh"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          beforeMount={handleEditorBeforeMount}
          onMount={handleEditorDidMount}
          language={scriptType}
          path={scriptType === 'javascript' ? 'index.js' : 'index.ts'}
          defaultValue={editorInitialValue}
        />
      </div>
    );
  }
);
