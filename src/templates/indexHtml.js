export function getIndexHtmlTemplate(ext, customFonts, fontChoice) {
  const fontUrl =
    customFonts && fontChoice !== "None"
      ? `<link href="https://fonts.googleapis.com/css2?family=${fontChoice}:wght@400;700&display=swap" rel="stylesheet">`
      : "";
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${fontUrl}
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
  </html>
  `.trim();
}
