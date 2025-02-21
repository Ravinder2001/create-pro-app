#!/usr/bin/env node
import { run } from "./src/cli.js";
import chalk from "chalk";

run().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});