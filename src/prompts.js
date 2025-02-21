import inquirer from "inquirer";
import chalk from "chalk";

export async function getUserConfig() {
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

  return confirm.proceed ? answers : null;
}
