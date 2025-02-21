export function getPrettierConfigTemplate() {
  return JSON.stringify(
    {
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      printWidth: 150,
      proseWrap: "preserve",
      bracketSpacing: true,
      bracketSameLine: false,
      tabWidth: 2,
      arrowParens: "always",
    },
    null,
    2
  );
}

export function getPrettierIgnoreTemplate() {
  return `
  # Dependencies
  node_modules/
  # Build output
  dist/
  dist-ssr/
  # Configuration files
  *.config.js
  *.config.ts
  tsconfig.json
  .prettierrc
  # Generated files
  *.min.js
  *.bundle.js
  # Logs
  *.log
  # Environment files
  .env
  .env.*
  # Lock files
  package-lock.json
  yarn.lock
  # Miscellaneous
  coverage/
  `.trim();
}
