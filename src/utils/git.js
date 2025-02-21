import { execa } from "execa";
import fs from "fs-extra";
import path from "path";

export async function initializeGit(projectDir) {
  await execa("git", ["init"], { cwd: projectDir });
  await fs.writeFile(path.join(projectDir, ".gitignore"), getGitignoreTemplate());
}

function getGitignoreTemplate() {
  return `
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
`.trim();
}
