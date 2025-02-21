export function getTsConfigTemplate() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "node",
        jsx: "react-jsx",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    },
    null,
    2
  );
}

export function getEslintConfigTemplate(isTs) {
  return `
  ${isTs ? "import tsEslintParser from '@typescript-eslint/parser';" : "import babelEslintParser from '@babel/eslint-parser';"}
  import eslint from '@eslint/js';
  import reactPlugin from 'eslint-plugin-react';
  import reactHooksPlugin from 'eslint-plugin-react-hooks';
  
  export default [
    eslint.configs.recommended,
    {
      files: ['**/*.{js,jsx${isTs ? ",ts,tsx" : ""}}'],
      languageOptions: {
        parser: ${isTs ? "tsEslintParser" : "babelEslintParser"},
        parserOptions: {
          ${isTs ? "sourceType: 'module'," : "requireConfigFile: false,"}
          ${isTs ? "project: './tsconfig.json'," : "babelOptions: { presets: ['@babel/preset-react'] },"}
          ecmaVersion: 'latest',
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          localStorage: true,
          window: true,
          document: true,
          console: true,
        },
      },
      plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        ...reactPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
        'react/prop-types': 'off',
        ${isTs ? "'@typescript-eslint/no-explicit-any': 'off'," : ""}
      },
    },
  ];
  `.trim();
}
