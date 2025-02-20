#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";

async function run() {
  console.log(chalk.green("Welcome to create-pro-app!"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: "my-pro-app",
    },
    {
      type: "list",
      name: "language",
      message: "Choose a language:",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
    {
      type: "confirm",
      name: "authentication",
      message: "Do you want authentication to protect routes?",
      default: false,
    },
    {
      type: "list",
      name: "stateManagement",
      message: "Choose a state management library:",
      choices: ["Redux Toolkit", "Zustand"],
      default: "Redux Toolkit",
    },
    {
      type: "confirm",
      name: "persist",
      message: "Do you want to add state persistence?",
      default: false,
    },
    {
      type: "list",
      name: "apiHandler",
      message: "Choose an API handler:",
      choices: ["Axios", "Fetch"],
      default: "Axios",
    },
    {
      type: "confirm",
      name: "tailwind",
      message: "Do you want to use Tailwind CSS?",
      default: false,
    },
    {
      type: "confirm",
      name: "customFonts",
      message: "Do you want to add custom fonts (e.g., Roboto from Google Fonts)?",
      default: false,
    },
    {
      type: "confirm",
      name: "shadcn",
      message: "Do you want to integrate Shadcn UI library (requires Tailwind CSS)?",
      default: false,
      when: (answers) => answers.tailwind,
    },
    {
      type: "confirm",
      name: "husky",
      message: "Do you want to set up Husky for git hooks?",
      default: false,
    },
    {
      type: "confirm",
      name: "prettier",
      message: "Do you want to add Prettier for code formatting?",
      default: true,
    },
    {
      type: "confirm",
      name: "eslint",
      message: "Do you want to add ESLint for linting?",
      default: true,
    },
  ]);

  await createProject(answers);
}

async function createProject({
  projectName,
  language,
  authentication,
  stateManagement,
  persist,
  apiHandler,
  tailwind,
  customFonts,
  shadcn,
  husky,
  prettier,
  eslint,
}) {
  const projectDir = path.join(process.cwd(), projectName);
  const isTs = language === "TypeScript";
  const ext = isTs ? "tsx" : "jsx";

  await fs.ensureDir(projectDir);
  console.log(chalk.blue(`Creating project: ${projectName}`));

  await execa("npm", ["init", "-y"], { cwd: projectDir });

  const reactDeps = isTs
    ? ["react", "react-dom", "@types/react", "@types/react-dom"]
    : ["react", "react-dom"];
  await execa("npm", ["install", ...reactDeps], { cwd: projectDir });

  const devDeps = ["vite", "@vitejs/plugin-react"];
  if (isTs) devDeps.push("typescript");
  await execa("npm", ["install", "--save-dev", ...devDeps], { cwd: projectDir });

  await createProjectStructure(
    projectDir,
    ext,
    authentication,
    stateManagement,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    shadcn
  );

  await installDependencies(
    projectDir,
    authentication,
    stateManagement,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    shadcn,
    husky,
    prettier,
    eslint
  );

  await generateConfigFiles(
    projectDir,
    isTs,
    tailwind,
    shadcn,
    prettier,
    eslint,
    husky
  );

  console.log(chalk.green(`Project ${projectName} created successfully!`));
  console.log(chalk.yellow(`cd ${projectName} && npm run dev`));
}

async function createProjectStructure(
  projectDir,
  ext,
  authentication,
  stateManagement,
  persist,
  apiHandler,
  tailwind,
  customFonts,
  shadcn
) {
  const srcDir = path.join(projectDir, "src");
  await fs.ensureDir(srcDir);

  await fs.writeFile(
    path.join(srcDir, `App.${ext}`),
    getAppTemplate(ext, authentication, stateManagement, persist, tailwind, shadcn)
  );
  await fs.writeFile(
    path.join(srcDir, `main.${ext}`),
    getMainTemplate(ext, stateManagement, persist)
  );
  await fs.writeFile(
    path.join(projectDir, "index.html"),
    getIndexHtmlTemplate(ext, customFonts)
  );

  if (authentication) {
    const routesDir = path.join(srcDir, "routes");
    await fs.ensureDir(routesDir);
    await fs.writeFile(
      path.join(routesDir, `PrivateRoutes.${ext}`),
      getPrivateRoutesTemplate(ext)
    );
    await fs.writeFile(
      path.join(routesDir, `PublicRoutes.${ext}`),
      getPublicRoutesTemplate(ext)
    );
    await fs.writeFile(
      path.join(routesDir, `ProjectRoutes.${ext}`),
      getProjectRoutesTemplate(ext)
    );
  }

  await createStore(projectDir, ext, stateManagement, persist, authentication);
  await createApiHandler(projectDir, ext, apiHandler);

  if (tailwind) {
    await fs.writeFile(
      path.join(srcDir, "index.css"),
      getTailwindCssTemplate()
    );
  }

  if (shadcn) {
    await initializeShadcn(projectDir, ext);
  }
}

async function installDependencies(
    projectDir,
    authentication,
    stateManagement,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    shadcn,
    husky,
    prettier,
    eslint
  ) {
    const deps = [];
    const devDeps = [];
  
    deps.push("react-router-dom");
  
    if (stateManagement === "Redux Toolkit") {
      deps.push("@reduxjs/toolkit", "react-redux");
      if (persist) deps.push("redux-persist");
    } else if (stateManagement === "Zustand") {
      deps.push("zustand");
      if (persist) deps.push("zustand/middleware");
    }
  
    if (apiHandler === "Axios") deps.push("axios");
  
    if (tailwind) {
      devDeps.push("tailwindcss", "postcss", "autoprefixer", "@tailwindcss/postcss"); // Add @tailwindcss/postcss
    }
    if (shadcn) {
      deps.push("clsx", "tailwind-merge");
    }
  
    if (husky) devDeps.push("husky");
    if (prettier) devDeps.push("prettier");
    if (eslint) {
      devDeps.push(
        "eslint",
        "eslint-plugin-react",
        "eslint-plugin-react-hooks",
        "@eslint/js"
      );
    }
  
    if (deps.length) {
      await execa("npm", ["install", ...deps], { cwd: projectDir });
    }
    if (devDeps.length) {
      await execa("npm", ["install", "--save-dev", ...devDeps], { cwd: projectDir });
    }
  }

async function generateConfigFiles(
  projectDir,
  isTs,
  tailwind,
  shadcn,
  prettier,
  eslint,
  husky
) {
  await fs.writeFile(
    path.join(projectDir, `vite.config.${isTs ? "ts" : "js"}`),
    getViteConfigTemplate(isTs)
  );

  if (tailwind) {
    await fs.writeFile(
      path.join(projectDir, `tailwind.config.${isTs ? "ts" : "js"}`),
      getTailwindConfigTemplate(isTs)
    );
    await fs.writeFile(
      path.join(projectDir, "postcss.config.js"),
      getPostcssConfigTemplate()
    );
  }

  if (shadcn) {
    await fs.writeFile(
      path.join(projectDir, "components.json"),
      getShadcnConfigTemplate(isTs)
    );
  }

  if (prettier) {
    await fs.writeFile(
      path.join(projectDir, ".prettierrc"),
      JSON.stringify({ semi: true, singleQuote: true }, null, 2)
    );
  }

  if (eslint) {
    await fs.writeFile(
      path.join(projectDir, ".eslintrc.cjs"),
      getEslintConfigTemplate()
    );
  }

  if (husky) {
    await execa("npm", ["pkg", "set", "scripts.prepare=husky"], { cwd: projectDir });
    await execa("npx", ["husky", "init"], { cwd: projectDir });
    await fs.writeFile(
      path.join(projectDir, ".husky", "pre-commit"),
      "npm run lint"
    );
  }

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.scripts = {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    ...(eslint && { lint: `eslint src/**/*.{js,jsx,ts,tsx}` }),
  };
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

function getAppTemplate(ext, authentication, stateManagement, persist, tailwind, shadcn) {
  return `
import React from 'react';
import { BrowserRouter as Router${authentication ? ", Routes, Route" : ""} } from 'react-router-dom';
${
  stateManagement === "Redux Toolkit"
    ? `import { Provider } from 'react-redux';\nimport { store${persist ? ", persistor" : ""} } from './store/store';`
    : stateManagement === "Zustand"
    ? ""
    : ""
}
${persist && stateManagement === "Redux Toolkit" ? "import { PersistGate } from 'redux-persist/integration/react';" : ""}
${authentication ? "import PrivateRoutes from './routes/PrivateRoutes';" : ""}
${authentication ? "import PublicRoutes from './routes/PublicRoutes';" : ""}
${authentication ? "import ProjectRoutes from './routes/ProjectRoutes';" : ""}
${tailwind ? "import './index.css';" : ""}
${shadcn ? "import { cn } from './lib/utils';" : ""}

function App() {
  return (
    ${
      stateManagement === "Redux Toolkit"
        ? `<Provider store={store}>${persist ? "<PersistGate loading={null} persistor={persistor}>" : ""}`
        : ""
    }
    <Router>
      ${
        authentication
          ? `<Routes>
        <Route path="/*" element={<PublicRoutes />} />
        <Route path="/app/*" element={<PrivateRoutes />}>
          <Route path="*" element={<ProjectRoutes />} />
        </Route>
      </Routes>`
          : `<div${tailwind ? ' className="text-center p-4"' : shadcn ? ' className={cn("text-center p-4")}' : ""}>Hello, World!</div>`
      }
    </Router>
    ${stateManagement === "Redux Toolkit" ? (persist ? "</PersistGate>" : "") + "</Provider>" : ""}
  );
}

export default App;
`;
}

function getMainTemplate(ext, stateManagement, persist) {
  return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
${stateManagement === "Redux Toolkit" && persist ? "import './store/store';" : ""}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function getIndexHtmlTemplate(ext, customFonts) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${customFonts ? '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">' : ""}
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.${ext}"></script>
</body>
</html>
`;
}

function getTailwindCssTemplate() {
  return `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

function getTailwindConfigTemplate(isTs) {
  return `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{${isTs ? "ts,tsx" : "js,jsx"}}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

function getPostcssConfigTemplate() {
    return `
  module.exports = {
    plugins: {
      '@tailwindcss/postcss': {}, // Use @tailwindcss/postcss instead of tailwindcss
      autoprefixer: {},
    },
  }
  `;
  }

function getShadcnConfigTemplate(isTs) {
  return JSON.stringify(
    {
      style: "default",
      tsx: isTs,
      tailwind: {
        config: `tailwind.config.${isTs ? "ts" : "js"}`,
        css: "src/index.css",
        baseColor: "gray",
        cssVariables: true,
      },
      aliases: {
        components: "src/components",
        utils: "src/lib/utils",
      },
    },
    null,
    2
  );
}

async function initializeShadcn(projectDir, ext) {
  const libDir = path.join(projectDir, "src", "lib");
  await fs.ensureDir(libDir);
  await fs.writeFile(
    path.join(libDir, `utils.${ext}`),
    `
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`
  );

  const componentsDir = path.join(projectDir, "src", "components", "ui");
  await fs.ensureDir(componentsDir);
  await fs.writeFile(
    path.join(componentsDir, `button.${ext}`),
    `
import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        "bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
`
  );
}

function getPrivateRoutesTemplate(ext) {
  return `
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  const isAuthenticated = false; // Replace with your auth logic
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
`;
}

function getPublicRoutesTemplate(ext) {
  return `
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default PublicRoutes;
`;
}

function getProjectRoutesTemplate(ext) {
  return `
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ProjectRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
    </Routes>
  );
};

export default ProjectRoutes;
`;
}

function getViteConfigTemplate(isTs) {
  return `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
}

function getEslintConfigTemplate() {
  return `
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'react/prop-types': 'off',
  },
};
`;
}

async function createStore(projectDir, ext, stateManagement, persist, authentication) {
  const storeDir = path.join(projectDir, "src", "store");
  await fs.ensureDir(storeDir);

  if (stateManagement === "Redux Toolkit") {
    await fs.writeFile(
      path.join(storeDir, `store.${ext}`),
      getReduxStoreTemplate(ext, persist)
    );
    if (authentication) {
      await fs.writeFile(
        path.join(storeDir, `userSlice.${ext}`),
        getUserSliceTemplate(ext, persist)
      );
    }
  } else if (stateManagement === "Zustand") {
    await fs.writeFile(
      path.join(storeDir, `useStore.${ext}`),
      getZustandStoreTemplate(ext, persist, authentication)
    );
  }
}

function getReduxStoreTemplate(ext, persist) {
  return `
import { configureStore } from '@reduxjs/toolkit';
${persist ? "import { persistStore, persistReducer } from 'redux-persist';\nimport storage from 'redux-persist/lib/storage';" : ""}
import userSlice from './userSlice';

const persistConfig = ${persist ? "{ key: 'root', storage }" : "{}"};

const rootReducer = {
  user: ${persist ? "persistReducer(persistConfig, userSlice)" : "userSlice"},
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

${persist ? "export const persistor = persistStore(store);" : ""}
`;
}

function getUserSliceTemplate(ext, persist) {
  return `
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.id = action.payload.id;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.id = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
`;
}

function getZustandStoreTemplate(ext, persist, authentication) {
  return `
import { create } from 'zustand';
${persist ? "import { persist } from 'zustand/middleware';" : ""}

const useStore = create(
  ${persist ? "persist(" : ""}
    (set) => ({
      ${authentication ? "id: null," : ""}
      ${authentication ? "isAuthenticated: false," : ""}
      ${authentication ? `setUser: (id) => set({ id, isAuthenticated: true }),` : ""}
      ${authentication ? "clearUser: () => set({ id: null, isAuthenticated: false })," : ""}
    }),
    ${persist ? "{ name: 'app-storage' }" : ""}
  ${persist ? ")" : ""}
);

export default useStore;
`;
}

async function createApiHandler(projectDir, ext, apiHandler) {
  const apiDir = path.join(projectDir, "src", "api");
  await fs.ensureDir(apiDir);

  if (apiHandler === "Axios") {
    await fs.writeFile(
      path.join(apiDir, `api.${ext}`),
      getAxiosTemplate(ext)
    );
  } else {
    await fs.writeFile(
      path.join(apiDir, `api.${ext}`),
      getFetchTemplate(ext)
    );
  }
}

function getAxiosTemplate(ext) {
  return `
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
`;
}

function getFetchTemplate(ext) {
  return `
const apiFetch = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = \`Bearer \${token}\`;
  }

  const response = await fetch(\`https://api.example.com\${url}\`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
    }
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export default apiFetch;
`;
}

run().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});