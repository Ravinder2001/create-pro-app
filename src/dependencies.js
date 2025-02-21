import fs from "fs-extra";
import { execa } from "execa";
import chalk from "chalk";
import path from "path";

export async function initializeProject(projectDir, packageManager, isTs, spinner) {
  spinner.text = "Creating project directory...";
  spinner.start();
  await fs.ensureDir(projectDir);
  spinner.succeed();

  spinner.text = "Initializing package.json...";
  spinner.start();
  await execa(packageManager, ["init", "-y"], { cwd: projectDir });
  spinner.succeed();
}

export async function installBaseDependencies(projectDir, packageManager, isTs, spinner) {
  const installCommand = packageManager === "npm" ? "install" : "add";
  const devFlag = packageManager === "npm" ? "--save-dev" : "-D";

  spinner.text = "Installing React dependencies...";
  spinner.start();
  const reactDeps = isTs ? ["react", "react-dom", "@types/react", "@types/react-dom"] : ["react", "react-dom"];
  await execa(packageManager, [installCommand, ...reactDeps], { cwd: projectDir });
  spinner.succeed();

  spinner.text = "Installing Vite and dev dependencies...";
  spinner.start();
  const devDeps = ["vite", "@vitejs/plugin-react"];
  if (isTs) devDeps.push("typescript");
  await execa(packageManager, [installCommand, devFlag, ...devDeps], { cwd: projectDir });
  spinner.succeed();

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJsonAfterDevDeps = await fs.readJson(packageJsonPath);
  console.log(chalk.blue("package.json after dev dependencies:"), packageJsonAfterDevDeps);
}

export async function installDependencies(projectDir, packageManager, config, isTs) {
  const { authentication, stateManager, persist, apiHandler, tailwind, shadcn, husky, prettier, eslint } = config;
  const deps = ["react-router-dom", "react-error-boundary"];
  const devDeps = [];

  if (stateManager) {
    deps.push("@reduxjs/toolkit", "react-redux");
    if (persist) deps.push("redux-persist");
  }
  if (apiHandler === "Axios") deps.push("axios");
  if (tailwind) devDeps.push("tailwindcss", "@tailwindcss/vite", "autoprefixer");
  if (shadcn) deps.push("clsx", "tailwind-merge");
  if (husky) devDeps.push("husky");
  if (prettier) devDeps.push("prettier", "lint-staged");
  if (eslint) {
    devDeps.push(
      "eslint",
      "@eslint/js",
      "eslint-plugin-react",
      "eslint-plugin-react-hooks",
      isTs ? "@typescript-eslint/parser" : "@babel/eslint-parser"
    );
    if (!isTs) devDeps.push("@babel/preset-react");
  }

  const installCommand = packageManager === "npm" ? "install" : "add";
  const devFlag = packageManager === "npm" ? "--save-dev" : "-D";

  if (deps.length) await execa(packageManager, [installCommand, ...deps], { cwd: projectDir });
  if (devDeps.length) await execa(packageManager, [installCommand, devFlag, ...devDeps], { cwd: projectDir });
}
