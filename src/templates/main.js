export function getMainTemplate(ext, stateManager, persist, tailwind) {
  const isTs = ext === "tsx";
  const lines = [
    `import React from 'react';`,
    `import ReactDOM from 'react-dom/client';`,
    `import { BrowserRouter as Router } from 'react-router-dom';`,
    `import App from './App';`,
    ...(tailwind ? [`import './index.css';`] : []),
    ...(stateManager
      ? [
          `import { Provider } from 'react-redux';`,
          `import { store${persist ? ", persistor" : ""} } from './store/store';`,
          ...(persist ? [`import { PersistGate } from 'redux-persist/integration/react';`] : []),
        ]
      : []),
    "",
    `const root = ReactDOM.createRoot(document.getElementById('root')${isTs ? " as HTMLDivElement" : ""});`,
    `root.render(`,
    ...(stateManager ? [`  <Provider store={store}>`] : []),
    ...(persist ? [`    <PersistGate loading={null} persistor={persistor}>`] : []),
    `    <Router>`,
    `      <React.StrictMode>`,
    `        <App />`,
    `      </React.StrictMode>`,
    `    </Router>`,
    ...(persist ? [`    </PersistGate>`] : []),
    ...(stateManager ? [`  </Provider>`] : []),
    `);`,
  ];
  return lines.join("\n");
}
