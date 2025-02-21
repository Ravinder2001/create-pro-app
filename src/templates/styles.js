import fs from "fs-extra";
import path from "path";

export function getTailwindCssTemplate(customFonts, fontChoice) {
  return `
@import "tailwindcss";

:root {
    --fontFamily: ${customFonts && fontChoice !== "None" ? `"${fontChoice}"` : "sans-serif"};
}

body {
    font-family: var(--fontFamily);
}
`.trim();
}

export function getViteConfigTemplate(isTs, tailwind) {
  return `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
${tailwind ? "import tailwindcss from '@tailwindcss/vite';\nimport autoprefixer from 'autoprefixer';" : ""}

export default defineConfig({
  plugins: [react(), ${tailwind ? "tailwindcss(), autoprefixer()" : ""}],
});
`.trim();
}

export function getTailwindConfigTemplate(isTs) {
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
`.trim();
}

export function getShadcnConfigTemplate(isTs) {
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

export async function initializeShadcn(projectDir, ext, shadcnComponents) {
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
`.trim()
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
`.trim()
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
`.trim()
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
`.trim()
    );
  }
}
