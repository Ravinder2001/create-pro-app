# 🚀 Create Pro App

![Version](https://img.shields.io/npm/v/create-pro-app?style=for-the-badge)
![License](https://img.shields.io/npm/l/create-pro-app?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Vite](https://img.shields.io/badge/Vite-4.x-blueviolet?style=for-the-badge&logo=vite)

**Create Pro App** is a powerful, modern CLI tool to scaffold professional React applications with lightning-fast setup. Built with Vite under the hood, it offers a customizable boilerplate packed with features like authentication, state management, Tailwind CSS, and more—perfect for developers who want to hit the ground running.

---

## ✨ Features

- **Language Options**: Choose between **JavaScript** or **TypeScript** for your project.
- **Package Managers**: Supports **npm** or **Yarn**—your choice!
- **Project Templates**:
  - **Minimal**: A clean, lightweight React setup.
  - **Dashboard**: A pre-styled dashboard template (requires Tailwind CSS).
- **Authentication**: Add route protection with a sleek login page.
- **State Management**: Integrate **Redux Toolkit** with optional persistence.
- **API Handling**: Pick **Axios** or **Fetch** for seamless API integration.
- **Styling**:
  - **Tailwind CSS**: Rapidly style your app with utility classes.
  - **Custom Fonts**: Select from Google Fonts like Roboto, Inter, Poppins, etc.
- **Developer Tools**:
  - **Git**: Initialize a Git repository with a robust `.gitignore`.
  - **Husky**: Set up Git hooks for pre-commit linting/formatting.
  - **Prettier**: Enforce consistent code formatting with a `.prettierignore`.
  - **ESLint**: Lint your code with modern React and TypeScript support.

---

## 🛠️ Installation

Get started in seconds by installing `create-pro-app` globally or running it via `npx`.

### Via npm
```bash
npm install -g create-pro-app
create-pro-app
```

### Via Yarn
```bash
yarn global add create-pro-app
create-pro-app
```

### Via npx (No Install Required)
```bash
npx create-pro-app
```

---

## 🎉 Usage

1. **Run the CLI**:
   ```bash
   create-pro-app
   ```
   Or, if installed globally:
   ```bash
   create-pro-app
   ```

2. **Answer the Prompts**:
   - **Project Name**: Name your project (e.g., `my-pro-app`).
   - **Language**: Pick `JavaScript` or `TypeScript`.
   - **Package Manager**: Choose `npm` or `Yarn`.
   - **Template**: Select `Minimal` or `Dashboard`.
   - **Features**: Enable authentication, Redux, Tailwind, etc., as needed.

3. **Review & Confirm**:
   - A preview of your configuration will appear. Confirm to proceed!

4. **Project Setup**:
   - The CLI will create your project directory, install dependencies, and generate files with a delightful spinner animation.

5. **Start Coding**:
   ```bash
   cd your-project-name
   npm run dev  # or yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📂 Project Structure

Here’s what your generated project looks like:

```
your-project-name/
├── node_modules/           # Dependencies
├── src/                   # Source code
│   ├── components/        # React components (e.g., Dashboard)
│   ├── pages/             # Pages (e.g., Login) if authentication is enabled
│   ├── routes/            # Route definitions (if authentication is enabled)
│   ├── store/             # Redux store and slices (if selected)
│   ├── utils/             # API handlers (axiosInstance or fetchInstance)
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS (if selected)
├── .gitignore             # Git ignore file
├── .prettierignore        # Prettier ignore file (if Prettier is enabled)
├── .prettierrc            # Prettier config (if enabled)
├── eslint.config.js       # ESLint config (if enabled)
├── index.html             # HTML entry point
├── package.json           # Project metadata and scripts
├── tailwind.config.js     # Tailwind config (if enabled)
├── tsconfig.json          # TypeScript config (if TypeScript is selected)
└── vite.config.js         # Vite configuration
```

---

## ⚙️ Configuration Options

### **Prompts Breakdown**
| Prompt                | Options/Choices                          | Description                                                                 |
|-----------------------|------------------------------------------|-----------------------------------------------------------------------------|
| `projectName`         | Text input (default: `my-pro-app`)       | Name of your project directory.                                            |
| `language`            | `JavaScript`, `TypeScript`               | Programming language for your app.                                         |
| `packageManager`      | `npm`, `Yarn`                            | Tool to manage dependencies.                                               |
| `template`            | `Minimal`, `Dashboard`                   | Base structure of your app (Dashboard requires Tailwind).                  |
| `authentication`      | Yes/No                                   | Adds route protection with a login page.                                   |
| `stateManager`        | Yes/No                                   | Enables Redux Toolkit for global state.                                    |
| `persist`             | Yes/No                                   | Adds state persistence to Redux (requires `stateManager`).                 |
| `apiHandler`          | `Axios`, `Fetch`                         | HTTP client for API requests.                                              |
| `tailwind`            | Yes/No                                   | Integrates Tailwind CSS for styling.                                       |
| `customFonts`         | Yes/No                                   | Adds a custom Google Font.                                                 |
| `fontChoice`          | `Roboto`, `Inter`, etc.                  | Selects a font (if `customFonts` is enabled).                              |           |
| `gitInit`             | Yes/No                                   | Initializes a Git repository.                                              |
| `husky`               | Yes/No                                   | Sets up Husky for Git hooks.                                               |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).


## 🌐 Get in Touch

- **Issues**: [File a bug or feature request](https://github.com/Ravinder2001)
- **Email**: rvnegi786@gmail.com

---

**Built with ❤️ by Ravinder Singh Negi. Happy coding!**