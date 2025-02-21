import fs from "fs-extra";
import path from "path";
import { getAppTemplate } from "./templates/app.js";
import { getMainTemplate } from "./templates/main.js";
import { getIndexHtmlTemplate } from "./templates/indexHtml.js";
import { getErrorFallbackTemplate } from "./templates/errorFallback.js";
import { getPrivateRoutesTemplate, getPublicRoutesTemplate, getProjectRoutesTemplate } from "./templates/routes.js";
import { getLoginTemplate, getDashboardTemplate } from "./templates/components.js";
import { createStore } from "./templates/store.js";
import { createApiHandler } from "./templates/api.js";
import { getTailwindCssTemplate, initializeShadcn } from "./templates/styles.js";

export async function createProjectStructure(projectDir, ext, config) {
  const { template, authentication, stateManager, persist, apiHandler, tailwind, customFonts, fontChoice, shadcnComponents } = config;
  const srcDir = path.join(projectDir, "src");
  const componentsDir = path.join(srcDir, "components");

  await fs.remove(srcDir);
  await fs.ensureDir(srcDir);
  await fs.ensureDir(componentsDir);

  await fs.writeFile(path.join(srcDir, `App.${ext}`), getAppTemplate(ext, template, authentication, stateManager, persist, tailwind));
  await fs.writeFile(path.join(srcDir, `main.${ext}`), getMainTemplate(ext, stateManager, persist, tailwind));
  await fs.writeFile(path.join(projectDir, "index.html"), getIndexHtmlTemplate(ext, customFonts, fontChoice));
  await fs.writeFile(path.join(componentsDir, `ErrorFallback.${ext}`), getErrorFallbackTemplate(ext, tailwind));

  if (authentication) {
    const routesDir = path.join(srcDir, "routes");
    await fs.ensureDir(routesDir);
    await fs.writeFile(path.join(routesDir, `PrivateRoutes.${ext}`), getPrivateRoutesTemplate(ext));
    await fs.writeFile(path.join(routesDir, `PublicRoutes.${ext}`), getPublicRoutesTemplate(ext));
    await fs.writeFile(path.join(routesDir, `ProjectRoutes.${ext}`), getProjectRoutesTemplate(ext, tailwind));
    const pagesDir = path.join(srcDir, "pages");
    await fs.ensureDir(pagesDir);
    await fs.writeFile(path.join(pagesDir, `Login.${ext}`), getLoginTemplate(ext, tailwind));
  }

  if (template === "Dashboard" || authentication) {
    await fs.writeFile(path.join(componentsDir, `Dashboard.${ext}`), getDashboardTemplate(ext, tailwind));
  }

  if (stateManager) {
    await createStore(projectDir, ext, authentication, persist);
  }

  await createApiHandler(projectDir, ext, apiHandler);

  if (tailwind) {
    await fs.writeFile(path.join(srcDir, "index.css"), getTailwindCssTemplate(customFonts, fontChoice));
  }
}
