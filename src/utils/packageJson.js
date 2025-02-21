import fs from "fs-extra";
import path from "path";
import { execa } from "execa";

export async function updatePackageJson(projectDir, packageManager, { eslint, prettier, husky }) {
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  if (husky) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.prepare = "husky";
    await execa("npx", ["husky", "init"], { cwd: projectDir });
    const preCommitCommand = prettier ? `${packageManager} run lint-staged\nnpm run lint` : `${packageManager} run lint`;
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
