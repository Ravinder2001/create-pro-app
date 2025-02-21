import chalk from "chalk";
import path from "path";
import ora from "ora";
import { initializeProject, installBaseDependencies } from "./dependencies.js";
import { createProjectStructure } from "./structure.js";
import { installDependencies } from "./dependencies.js";
import { generateConfigFiles } from "./config.js";
import { generateReadme } from "./config.js";

export async function createProject(config) {
  const { projectName, language, packageManager } = config;
  const projectDir = path.join(process.cwd(), projectName);
  const isTs = language === "TypeScript";
  const ext = isTs ? "tsx" : "jsx";
  const spinner = ora();

  await initializeProject(projectDir, packageManager, isTs, spinner);
  await installBaseDependencies(projectDir, packageManager, isTs, spinner);

  spinner.text = "Generating project structure...";
  spinner.start();
  await createProjectStructure(projectDir, ext, config);
  spinner.succeed();

  spinner.text = "Installing additional dependencies...";
  spinner.start();
  await installDependencies(projectDir, packageManager, config, isTs);
  spinner.succeed();

  spinner.text = "Generating configuration files...";
  spinner.start();
  await generateConfigFiles(projectDir, packageManager, config, isTs);
  spinner.succeed();

  spinner.text = "Generating README...";
  spinner.start();
  await generateReadme(projectDir, packageManager, config);
  spinner.succeed();

  console.log(chalk.green(`Project ${projectName} created successfully!`));
  console.log(chalk.yellow(`cd ${projectName} && ${packageManager === "npm" ? "npm run dev" : "yarn dev"}`));
}
