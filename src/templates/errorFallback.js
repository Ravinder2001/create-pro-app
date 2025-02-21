export function getErrorFallbackTemplate(ext, tailwind) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  ${isTs ? "import type { FC } from 'react';" : ""}
  ${isTs ? "import type { FallbackProps } from 'react-error-boundary';" : ""}
  
  const ErrorFallback${isTs ? ": FC<FallbackProps>" : ""} = (${isTs ? "{ error }: FallbackProps" : "{ error }"}) => {
    return (
      <div${tailwind ? ' className="min-h-screen flex items-center justify-center bg-gray-100"' : ""}>
        <div${tailwind ? ' className="bg-white p-6 rounded-lg shadow-lg text-center"' : ""}>
          <h1${tailwind ? ' className="text-2xl font-bold mb-4 text-red-600"' : ""}>Something went wrong</h1>
          <p${tailwind ? ' className="text-gray-600"' : ""}>{error.message}</p>
          <p${tailwind ? ' className="text-gray-600 mt-2"' : ""}>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  };
  
  export default ErrorFallback;
  `.trim();
}
