import fs from "fs-extra";
import path from "path";
import { getViteConfigTemplate } from "./templates/styles.js";
import { getTsConfigTemplate } from "./templates/configs.js";
import { getTailwindConfigTemplate, getShadcnConfigTemplate } from "./templates/styles.js";
import { getPrettierConfigTemplate, getPrettierIgnoreTemplate } from "./utils/prettier.js";
import { getEslintConfigTemplate } from "./templates/configs.js";
import { initializeGit } from "./utils/git.js";
import { updatePackageJson } from "./utils/packageJson.js";

export async function generateConfigFiles(projectDir, packageManager, config, isTs) {
  const { tailwind, prettier, eslint, husky, gitInit } = config;

  await fs.writeFile(path.join(projectDir, `vite.config.${isTs ? "ts" : "js"}`), getViteConfigTemplate(isTs, tailwind));
  if (isTs) await fs.writeFile(path.join(projectDir, "tsconfig.json"), getTsConfigTemplate());
  if (tailwind) await fs.writeFile(path.join(projectDir, `tailwind.config.${isTs ? "ts" : "js"}`), getTailwindConfigTemplate(isTs));
  if (prettier)
    await Promise.all([
      fs.writeFile(path.join(projectDir, ".prettierrc"), getPrettierConfigTemplate()),
      fs.writeFile(path.join(projectDir, ".prettierignore"), getPrettierIgnoreTemplate()),
    ]);
  if (eslint) await fs.writeFile(path.join(projectDir, "eslint.config.js"), getEslintConfigTemplate(isTs));
  if (gitInit) await initializeGit(projectDir);
  await updatePackageJson(projectDir, packageManager, { eslint, prettier, husky });
}

export async function generateReadme(projectDir, packageManager, features) {
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
  `;
  await fs.writeFile(path.join(projectDir, "README.md"), readmeContent.trim());
}
