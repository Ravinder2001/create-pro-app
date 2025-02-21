export function getAppTemplate(ext, template, authentication, stateManager, persist, tailwind, shadcn) {
  const isTs = ext === "tsx";
  const lines = [
    `import React, { lazy, Suspense } from 'react';`,
    `import { ErrorBoundary } from 'react-error-boundary';`,
    `import ErrorFallback from './components/ErrorFallback';`,
    `const ProjectRoutes = lazy(() => import('./routes/ProjectRoutes'));`,
    ...(shadcn ? [`import { cn } from './lib/utils';`] : []),
    ...(isTs ? [`import type { FC } from 'react';`] : []),
    "",
    `${isTs ? "const App: FC = () => {" : "function App() {"}`,
    `  return (`,
    `    <ErrorBoundary FallbackComponent={ErrorFallback} onError={(error, info) => console.error("Error:", error, info)}>`,
    `      <Suspense fallback={<div${tailwind ? ' className="text-center p-4"' : ""}>Loading...</div>}>`,
    `        <ProjectRoutes />`,
    `      </Suspense>`,
    `    </ErrorBoundary>`,
    `  );`,
    `}`,
    "",
    `export default App;`,
  ];
  return lines.join("\n");
}
