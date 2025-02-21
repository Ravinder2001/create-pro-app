export function getPrivateRoutesTemplate(ext) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  import { Navigate } from 'react-router-dom';
  ${isTs ? "import type { ReactNode } from 'react';" : ""}
  
  const PrivateRoutes = (${isTs ? "{ children }: { children: ReactNode }" : "{ children }"}) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  export default PrivateRoutes;
  `.trim();
}

export function getPublicRoutesTemplate(ext) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  import { Navigate } from 'react-router-dom';
  ${isTs ? "import type { ReactNode } from 'react';" : ""}
  
  const PublicRoutes = (${isTs ? "{ children }: { children: ReactNode }" : "{ children }"}) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    return !isAuthenticated ? children : <Navigate to="/" />;
  };
  
  export default PublicRoutes;
  `.trim();
}

export function getProjectRoutesTemplate(ext, tailwind) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  import { Routes, Route } from 'react-router-dom';
  import PrivateRoutes from './PrivateRoutes';
  import PublicRoutes from './PublicRoutes';
  import Dashboard from '../components/Dashboard';
  import Login from '../pages/Login';
  ${isTs ? "import type { FC } from 'react';" : ""}
  
  const ProjectRoutes${isTs ? ": FC" : ""} = () => {
    return (
      <Routes>
        <Route 
          path="/" 
          element={
            <PrivateRoutes>
              <Dashboard />
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoutes>
              <div${tailwind ? ' className="text-center p-4"' : ""}>Profile</div>
            </PrivateRoutes>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          } 
        />
        <Route 
          path="*" 
          element={
            <PublicRoutes>
              <div${tailwind ? ' className="text-center p-4"' : ""}>404 Not Found</div>
            </PublicRoutes>
          } 
        />
      </Routes>
    );
  };
  
  export default ProjectRoutes;
  `.trim();
}
