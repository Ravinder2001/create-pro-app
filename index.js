#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import ora from "ora";

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
      type: "list",
      name: "packageManager",
      message: "Choose a package manager:",
      choices: ["npm", "yarn"],
      default: "npm",
    },
    {
      type: "list",
      name: "template",
      message: "Choose a project template:",
      choices: ["Minimal", "Dashboard -- Need to add Tailwind for better UI."],
      default: "Minimal",
    },
    {
      type: "confirm",
      name: "authentication",
      message: "Do you want authentication to protect routes?",
      default: false,
    },
    {
      type: "confirm",
      name: "stateManager",
      message: "Do you want to use Redux Toolkit as a global state manager?",
      default: false,
    },
    {
      type: "confirm",
      name: "persist",
      message: "Do you want to add state persistence for Redux Toolkit?",
      default: false,
      when: (answers) => answers.stateManager,
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
      message: "Do you want to add custom fonts?",
      default: false,
    },
    {
      type: "list",
      name: "fontChoice",
      message: "Choose a font:",
      choices: ["Roboto", "Inter", "Poppins", "Open Sans", "Lato", "None"],
      default: "Roboto",
      when: (answers) => answers.customFonts,
    },
    {
      type: "confirm",
      name: "shadcn",
      message: "Do you want to integrate Shadcn UI library (requires Tailwind CSS)?",
      default: false,
      when: (answers) => answers.tailwind,
    },
    {
      type: "checkbox",
      name: "shadcnComponents",
      message: "Select Shadcn UI components to include:",
      choices: ["Button", "Input", "Card"],
      default: ["Button"],
      when: (answers) => answers.shadcn,
    },
    {
      type: "confirm",
      name: "gitInit",
      message: "Do you want to initialize a Git repository?",
      default: true,
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

  console.log(chalk.yellow("Configuration Preview:"));
  console.log(JSON.stringify(answers, null, 2));
  const confirm = await inquirer.prompt({
    type: "confirm",
    name: "proceed",
    message: "Do you want to proceed with this configuration?",
    default: true,
  });

  if (confirm.proceed) {
    await createProject(answers);
  } else {
    console.log(chalk.red("Project creation cancelled."));
  }
}

async function createProject({
  projectName,
  language,
  packageManager,
  template,
  authentication,
  stateManager,
  persist,
  apiHandler,
  tailwind,
  customFonts,
  fontChoice,
  shadcn,
  shadcnComponents,
  gitInit,
  husky,
  prettier,
  eslint,
}) {
  const projectDir = path.join(process.cwd(), projectName);
  const isTs = language === "TypeScript"; // Define isTs here
  const ext = isTs ? "tsx" : "jsx";

  const spinner = ora("Creating project directory...").start();
  await fs.ensureDir(projectDir);
  spinner.succeed();

  spinner.text = "Initializing package.json...";
  spinner.start();
  await execa(packageManager, ["init", "-y"], { cwd: projectDir });
  spinner.succeed();

  spinner.text = "Installing React dependencies...";
  spinner.start();
  const reactDeps = isTs ? ["react", "react-dom", "@types/react", "@types/react-dom"] : ["react", "react-dom"];
  const installCommand = packageManager === "npm" ? "install" : "add";
  await execa(packageManager, [installCommand, ...reactDeps], { cwd: projectDir });
  spinner.succeed();

  spinner.text = "Installing Vite and dev dependencies...";
  spinner.start();
  const devDeps = ["vite", "@vitejs/plugin-react"];
  if (isTs) devDeps.push("typescript");
  const devFlag = packageManager === "npm" ? "--save-dev" : "-D";
  await execa(packageManager, [installCommand, devFlag, ...devDeps], { cwd: projectDir });
  spinner.succeed();

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJsonAfterDevDeps = await fs.readJson(packageJsonPath);
  console.log(chalk.blue("package.json after dev dependencies:"), packageJsonAfterDevDeps);

  spinner.text = "Generating project structure...";
  spinner.start();
  await createProjectStructure(
    projectDir,
    ext,
    template,
    authentication,
    stateManager,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    fontChoice,
    shadcn,
    shadcnComponents
  );
  spinner.succeed();

  spinner.text = "Installing additional dependencies...";
  spinner.start();
  await installDependencies(
    projectDir,
    packageManager,
    authentication,
    stateManager,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    shadcn,
    husky,
    prettier,
    eslint,
    isTs // Pass isTs here
  );
  spinner.succeed();

  spinner.text = "Generating configuration files...";
  spinner.start();
  await generateConfigFiles(projectDir, isTs, packageManager, tailwind, shadcn, prettier, eslint, husky, gitInit);
  spinner.succeed();

  spinner.text = "Generating README...";
  spinner.start();
  await generateReadme(projectDir, packageManager, {
    projectName,
    language,
    template,
    authentication,
    stateManager,
    persist,
    apiHandler,
    tailwind,
    customFonts,
    fontChoice,
    shadcn,
    shadcnComponents,
    husky,
    prettier,
    eslint,
  });
  spinner.succeed();

  console.log(chalk.green(`Project ${projectName} created successfully!`));
  console.log(chalk.yellow(`cd ${projectName} && ${packageManager === "npm" ? "npm run dev" : "yarn dev"}`));
}

async function createProjectStructure(
  projectDir,
  ext,
  template,
  authentication,
  stateManager,
  persist,
  apiHandler,
  tailwind,
  customFonts,
  fontChoice,
  shadcn,
  shadcnComponents
) {
  const srcDir = path.join(projectDir, "src");

  await fs.remove(srcDir);
  await fs.ensureDir(srcDir);

  await fs.writeFile(path.join(srcDir, `App.${ext}`), getAppTemplate(ext, template, authentication, stateManager, persist, tailwind, shadcn));
  await fs.writeFile(path.join(srcDir, `main.${ext}`), getMainTemplate(ext, stateManager, persist, tailwind));
  await fs.writeFile(path.join(projectDir, "index.html"), getIndexHtmlTemplate(ext, customFonts, fontChoice));

  if (authentication) {
    const routesDir = path.join(srcDir, "routes");
    await fs.ensureDir(routesDir);
    await fs.writeFile(path.join(routesDir, `PrivateRoutes.${ext}`), getPrivateRoutesTemplate(ext));
    await fs.writeFile(path.join(routesDir, `PublicRoutes.${ext}`), getPublicRoutesTemplate(ext));
    await fs.writeFile(path.join(routesDir, `ProjectRoutes.${ext}`), getProjectRoutesTemplate(ext, tailwind));
    const pagesDir = path.join(srcDir, "pages");
    await fs.ensureDir(pagesDir);
    await fs.writeFile(path.join(pagesDir, `Login.${ext}`), getLoginTemplate(ext, tailwind, shadcn));
  }

  if (template === "Dashboard" || authentication) {
    const componentsDir = path.join(srcDir, "components");
    await fs.ensureDir(componentsDir);
    await fs.writeFile(
      path.join(componentsDir, `Dashboard.${ext}`),
      getDashboardTemplate(ext, tailwind, shadcn) // Pass shadcn here
    );
  }

  if (stateManager) {
    await createStore(projectDir, ext, authentication, persist);
  }

  await createApiHandler(projectDir, ext, apiHandler);

  if (tailwind) {
    await fs.writeFile(path.join(srcDir, "index.css"), getTailwindCssTemplate(customFonts, fontChoice));
  }

  if (shadcn) {
    await initializeShadcn(projectDir, ext, shadcnComponents);
  }
}

async function installDependencies(
  projectDir,
  packageManager,
  authentication,
  stateManager,
  persist,
  apiHandler,
  tailwind,
  customFonts,
  shadcn,
  husky,
  prettier,
  eslint,
  isTs // Add isTs parameter
) {
  const deps = [];
  const devDeps = [];

  deps.push("react-router-dom");

  if (stateManager) {
    deps.push("@reduxjs/toolkit", "react-redux");
    if (persist) deps.push("redux-persist");
  }

  if (apiHandler === "Axios") deps.push("axios");

  if (tailwind) {
    devDeps.push("tailwindcss", "@tailwindcss/vite", "autoprefixer");
  }
  if (shadcn) {
    deps.push("clsx", "tailwind-merge");
  }

  if (husky) devDeps.push("husky");
  if (prettier) {
    devDeps.push("prettier", "lint-staged");
  }
  if (eslint) {
    devDeps.push(
      "eslint",
      "@eslint/js",
      "eslint-plugin-react",
      "eslint-plugin-react-hooks",
      isTs ? "@typescript-eslint/parser" : "@babel/eslint-parser" // Use isTs here
    );
    if (!isTs) devDeps.push("@babel/preset-react"); // Required for JSX parsing with Babel
  }

  const installCommand = packageManager === "npm" ? "install" : "add";
  const devFlag = packageManager === "npm" ? "--save-dev" : "-D";

  if (deps.length) {
    await execa(packageManager, [installCommand, ...deps], { cwd: projectDir });
  }
  if (devDeps.length) {
    await execa(packageManager, [installCommand, devFlag, ...devDeps], { cwd: projectDir });
  }
}

async function generateConfigFiles(projectDir, isTs, packageManager, tailwind, shadcn, prettier, eslint, husky, gitInit) {
  await fs.writeFile(path.join(projectDir, `vite.config.${isTs ? "ts" : "js"}`), getViteConfigTemplate(isTs, tailwind));

  if (isTs) {
    await fs.writeFile(
      path.join(projectDir, "tsconfig.json"),
      JSON.stringify(
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
      )
    );
  }

  if (tailwind) {
    await fs.writeFile(path.join(projectDir, `tailwind.config.${isTs ? "ts" : "js"}`), getTailwindConfigTemplate(isTs));
  }

  if (shadcn) {
    await fs.writeFile(path.join(projectDir, "components.json"), getShadcnConfigTemplate(isTs));
  }

  if (prettier) {
    await fs.writeFile(
      path.join(projectDir, ".prettierrc"),
      JSON.stringify(
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
      )
    );

    // Add .prettierignore file
    await fs.writeFile(
      path.join(projectDir, ".prettierignore"),
      `
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
      `.trim()
    );
  }

  if (eslint) {
    await fs.writeFile(path.join(projectDir, "eslint.config.js"), getEslintConfigTemplate(isTs));
  }

  if (gitInit) {
    await execa("git", ["init"], { cwd: projectDir });
    await fs.writeFile(
      path.join(projectDir, ".gitignore"),
      `
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vite-specific
.vite/
vite.config.*.timestamp-*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.swp

# OS-specific files
.DS_Store
Thumbs.db

# Testing
coverage/

# Husky (if not needed in repo)
.husky/_/

# Lock files
package-lock.json
yarn.lock

# Miscellaneous
*.bak
*.gho
*.ori
*.tmp
    `.trim()
    );
  }

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  if (husky) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.prepare = "husky";
    await execa("npx", ["husky", "init"], { cwd: projectDir });
    const preCommitCommand = prettier
      ? `${packageManager} run lint-staged
    npm run lint`
      : `${packageManager} run lint`;
    await fs.writeFile(path.join(projectDir, ".husky", "pre-commit"), preCommitCommand);
  }

  packageJson.type = "module";
  packageJson.scripts = {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    ...(eslint && { lint: "eslint src/**/*.{js,jsx,ts,tsx}" }),
    ...(prettier && { "lint-staged": "lint-staged" }),
    ...(husky && packageJson.scripts.prepare ? { prepare: packageJson.scripts.prepare } : {}),
  };

  if (prettier) {
    packageJson["lint-staged"] = {
      "*.{js,jsx,ts,tsx,md,html,css}": ["prettier --write"],
    };
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function generateReadme(projectDir, packageManager, features) {
  const readmeContent = `
  # ${features.projectName}

  A professional React application generated with \`create-pro-app\`.

  ## Features
  - **Language**: ${features.language}
  - **Template**: ${features.template}
  ${features.authentication ? "- Authentication with protected routes and a login page" : ""}
  - **State Management**: Redux Toolkit${features.persist ? " with persistence" : ""}
  ${features.apiHandler ? `- API Handler: ${features.apiHandler}` : ""}
  ${features.tailwind ? "- Tailwind CSS for styling" : ""}
  ${features.customFonts && features.fontChoice !== "None" ? `- Custom Font: ${features.fontChoice}` : ""}
  ${features.shadcn ? `- Shadcn UI components: ${features.shadcnComponents.join(", ")}` : ""}
  ${features.husky ? "- Husky for git hooks" : ""}
  ${features.prettier ? "- Prettier for code formatting" : ""}
  ${features.eslint ? "- ESLint for linting" : ""}

  ## Getting Started

  1. Install dependencies:
     \`\`\`bash
     ${packageManager === "npm" ? "npm install" : "yarn install"}
     \`\`\`

  2. Start the development server:
     \`\`\`bash
     ${packageManager === "npm" ? "npm run dev" : "yarn dev"}
     \`\`\`

  3. Open [http://localhost:5173](http://localhost:5173) in your browser.

  ## Scripts
  - \`${packageManager === "npm" ? "npm run dev" : "yarn dev"}\`: Start the development server
  - \`${packageManager === "npm" ? "npm run build" : "yarn build"}\`: Build for production
  - \`${packageManager === "npm" ? "npm run preview" : "yarn preview"}\`: Preview the production build
  ${features.eslint ? `- \`${packageManager === "npm" ? "npm run lint" : "yarn lint"}\`: Run ESLint` : ""}
  ${features.prettier ? `- \`${packageManager === "npm" ? "npm run lint-staged" : "yarn lint-staged"}\`: Run lint-staged` : ""}

  ${
    features.authentication
      ? "## Authentication\n- A login page is available at `/login`.\n- The dashboard is protected and accessible at `/app/dashboard` after login."
      : ""
  }
  ${features.shadcn ? "## Shadcn UI\n- Use imported components from `src/components/ui/` in your app.\n- Example: `<Button>Click me</Button>`" : ""}
  `;
  await fs.writeFile(path.join(projectDir, "README.md"), readmeContent.trim());
}

function getAppTemplate(ext, template, authentication, stateManager, persist, tailwind, shadcn) {
  return `
  ${
    stateManager
      ? `import { Provider } from 'react-redux';
  import { store${persist ? ", persistor" : ""} } from './store/store';
  ${persist ? "import { PersistGate } from 'redux-persist/integration/react';" : ""}`
      : ""
  }
  import React from 'react';
  import { BrowserRouter as Router${authentication || template === "Dashboard" ? ", Routes, Route" : ""} } from 'react-router-dom';
  ${authentication ? "import PrivateRoutes from './routes/PrivateRoutes';" : ""}
  ${authentication ? "import PublicRoutes from './routes/PublicRoutes';" : ""}
  ${authentication ? "import ProjectRoutes from './routes/ProjectRoutes';" : ""}
  ${template === "Dashboard" || authentication ? "import Dashboard from './components/Dashboard';" : ""}
  ${shadcn ? "import { cn } from './lib/utils';" : ""}
  
  function App() {
    return (
      ${
        stateManager
          ? `<Provider store={store}>
        ${persist ? "<PersistGate loading={null} persistor={persistor}>" : ""}
        `
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
              : template === "Dashboard"
              ? `<Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>`
              : `<div${tailwind ? ' className="text-center p-4"' : shadcn ? ' className={cn("text-center p-4")}' : ""}>Hello, World!</div>`
          }
        </Router>
        ${stateManager ? (persist ? "</PersistGate>" : "") + "</Provider>" : ""}
    );
  }
  
  export default App;
  `;
}

function getMainTemplate(ext, stateManager, persist, tailwind) {
  return `
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App';
  ${tailwind ? "import './index.css';" : ""}
  ${stateManager && persist ? "import './store/store';" : ""}
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  `;
}

function getIndexHtmlTemplate(ext, customFonts, fontChoice) {
  const fontUrl =
    customFonts && fontChoice !== "None"
      ? `<link href="https://fonts.googleapis.com/css2?family=${fontChoice}:wght@400;700&display=swap" rel="stylesheet">`
      : "";
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${fontUrl}
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.${ext}"></script>
</body>
</html>
`;
}

function getTailwindCssTemplate(customFonts, fontChoice) {
  return `
@import "tailwindcss";

:root {
    --fontFamily: ${customFonts && fontChoice !== "None" ? `"${fontChoice}"` : "sans-serif"};
}

body {
    font-family: var(--fontFamily);
}
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

function getViteConfigTemplate(isTs, tailwind) {
  return `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${tailwind ? "import tailwindcss from '@tailwindcss/vite';\nimport autoprefixer from 'autoprefixer';" : ""}

export default defineConfig({
  plugins: [react(), ${tailwind ? "tailwindcss(), autoprefixer()" : ""}],
});
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

async function initializeShadcn(projectDir, ext, shadcnComponents) {
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

  if (shadcnComponents.includes("Button")) {
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

  if (shadcnComponents.includes("Input")) {
    await fs.writeFile(
      path.join(componentsDir, `input.${ext}`),
      `
import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
`
    );
  }

  if (shadcnComponents.includes("Card")) {
    await fs.writeFile(
      path.join(componentsDir, `card.${ext}`),
      `
import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
`
    );
  }
}

function getPrivateRoutesTemplate(ext) {
  return `
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = () => {
  // TODO: Replace with your authentication logic (e.g., Redux state, localStorage token, etc.)
  const isAuthenticated = localStorage.getItem('token') !== null; 
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
`;
}

function getPublicRoutesTemplate(ext) {
  return `
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default PublicRoutes;
`;
}

function getProjectRoutesTemplate(ext, tailwind) {
  return `
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

const ProjectRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<div${tailwind ? ' className="text-center p-4"' : ""}>Profile</div>} />
    </Routes>
  );
};

export default ProjectRoutes;
`;
}

function getLoginTemplate(ext, tailwind, shadcn) {
  return `
import React from 'react';
${tailwind && shadcn ? 'import { cn } from "../lib/utils";' : ""}

const Login = () => {
  return (
    <div${
      tailwind && shadcn
        ? ' className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100")}'
        : ' className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"'
    }>
      ${
        tailwind
          ? `
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Please sign in to continue</p>
        </div>

        <form>
          <div className="mb-6">
            <label 
              className="block text-sm font-medium text-gray-700 mb-2" 
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-6">
            <label 
              className="block text-sm font-medium text-gray-700 mb-2" 
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Sign In
          </button>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up now
            </a>
          </p>
        </form>
      </div>
      `
          : `<div className="text-center text-gray-800 text-xl">Login Page</div>`
      }
    </div>
  );
};

export default Login;
`;
}

function getDashboardTemplate(ext, tailwind, shadcn) {
  return `
import React from 'react';
${shadcn ? 'import { cn } from "../lib/utils";' : ""}

const Dashboard = () => {
  const sampleData = [
    { id: 1, name: "Project A", status: "Active" },
    { id: 2, name: "Project B", status: "Pending" },
    { id: 3, name: "Project C", status: "Completed" },
  ];

  return (
    <div${tailwind ? `${shadcn ? ' className={cn("min-h-screen p-6 bg-gray-100")}' : ' className="min-h-screen p-6 bg-gray-100"'}` : ""}>
      ${
        tailwind
          ? `
      <h1${shadcn ? ' className={cn("text-3xl font-bold mb-6")}' : ' className="text-3xl font-bold mb-6"'}>Dashboard</h1>
      <div${
        shadcn
          ? ' className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6")}'
          : ' className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"'
      }>
        {sampleData.map((item) => (
          <div key={item.id}${shadcn ? ' className={cn("bg-white p-4 rounded-lg shadow-md")}' : ' className="bg-white p-4 rounded-lg shadow-md"'}>
            <h2${shadcn ? ' className={cn("text-xl font-semibold")}' : ' className="text-xl font-semibold"'}>{item.name}</h2>
            <p${shadcn ? ' className={cn("text-gray-600")}' : ' className="text-gray-600"'}>Status: ${"${item.status}"}</p>
          </div>
        ))}
      </div>
      `
          : `
      <h1>Dashboard</h1>
      <ul>
        {sampleData.map((item) => (
          <li key={item.id}>${"${item.name}"} - ${"${item.status}"}</li>
        ))}
      </ul>
      `
      }
    </div>
  );
};

export default Dashboard;
`;
}

function getEslintConfigTemplate(isTs) {
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
        document: true
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
      'react/prop-types': 'off', // Disable prop-types since we use TypeScript or don't enforce it
    },
  },
];
`;
}

async function createStore(projectDir, ext, authentication, persist) {
  const storeDir = path.join(projectDir, "src", "store");
  await fs.ensureDir(storeDir);

  await fs.writeFile(path.join(storeDir, `store.${ext}`), getReduxStoreTemplate(ext, persist, authentication));

  if (authentication) {
    await fs.writeFile(path.join(storeDir, `userSlice.${ext}`), getUserSliceTemplate(ext, persist));
  } else if (!authentication) {
    await fs.writeFile(path.join(storeDir, `counterSlice.${ext}`), getCounterSliceTemplate(ext));
  }
}
function getCounterSliceTemplate(ext) {
  return `
  import { createSlice } from '@reduxjs/toolkit';
  
  const counterSlice = createSlice({
    name: 'counter',
    initialState: {
      value: 0,
    },
    reducers: {
      increment: (state) => {
        state.value += 1;
      },
      decrement: (state) => {
        state.value -= 1;
      },
      incrementByAmount: (state, action) => {
        state.value += action.payload;
      },
    },
  });
  
  export const { increment, decrement, incrementByAmount } = counterSlice.actions;
  export default counterSlice.reducer;
  `;
}
function getReduxStoreTemplate(ext, persist, authentication) {
  return `
  import { configureStore } from '@reduxjs/toolkit';
  ${persist ? "import { persistStore, persistReducer } from 'redux-persist';\nimport storage from 'redux-persist/lib/storage';" : ""}
  import ${authentication ? "userSlice" : "counterSlice"} from './${authentication ? "userSlice" : "counterSlice"}';
  
  const persistConfig = ${persist ? "{ key: 'root', storage }" : "{}"};
  
  const rootReducer = {
    ${authentication ? "user" : "counter"}: ${
    persist ? `persistReducer(persistConfig, ${authentication ? "userSlice" : "counterSlice"})` : authentication ? "userSlice" : "counterSlice"
  },
  };
  
  export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
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
  const utilsDir = path.join(projectDir, "src", "utils");
  await fs.ensureDir(utilsDir);

  if (apiHandler === "Axios") {
    await fs.writeFile(path.join(utilsDir, `axiosInstance.${ext}`), getAxiosTemplate(ext));
  } else {
    await fs.writeFile(path.join(utilsDir, `fetchInstance.${ext}`), getFetchTemplate(ext));
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
