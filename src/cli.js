import chalk from "chalk";
import { getUserConfig } from "./prompts.js";
import { createProject } from "./project.js";

export async function run() {
  const config = await getUserConfig();
  if (config) {
    await createProject(config);
  } else {
    console.log(chalk.red("Project creation cancelled."));
  }
}
