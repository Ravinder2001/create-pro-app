import fs from "fs-extra";
import path from "path";

export async function createApiHandler(projectDir, ext, apiHandler) {
  const utilsDir = path.join(projectDir, "src", "utils");
  await fs.ensureDir(utilsDir);

  if (apiHandler === "Axios") {
    await fs.writeFile(path.join(utilsDir, `axiosInstance.${ext}`), getAxiosTemplate(ext));
  } else {
    await fs.writeFile(path.join(utilsDir, `fetchInstance.${ext}`), getFetchTemplate(ext));
  }
}

function getAxiosTemplate(ext) {
  return `
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default api;
`.trim();
}

function getFetchTemplate(ext) {
  return `
const apiFetch = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = \`Bearer \${token}\`;
  }

  const response = await fetch(\`https://api.example.com\${url}\`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
    }
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export default apiFetch;
`.trim();
}
