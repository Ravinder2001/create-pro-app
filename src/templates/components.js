export function getLoginTemplate(ext, tailwind, shadcn) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  ${tailwind && shadcn ? 'import { cn } from "../lib/utils";' : ""}
  ${isTs ? "import type { FC } from 'react';" : ""}
  
  const Login${isTs ? ": FC" : ""} = () => {
    return (
      <div${
        tailwind && shadcn
          ? ' className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100")}'
          : ' className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"'
      } >
        ${
          tailwind
            ? `
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Please sign in to continue</p>
          </div>
          <form>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email Address</label>
              <input type="email" id="email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="you@example.com" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">Password</label>
              <input type="password" id="password" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Enter your password" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Sign In</button>
            <p className="text-center text-gray-600 mt-6">Don't have an account? <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Sign up now</a></p>
          </form>
        </div>
        `
            : `<div className="text-center text-gray-800 text-xl">Login Page</div>`
        }
      </div>
    );
  };
  
  export default Login;
  `.trim();
}

export function getDashboardTemplate(ext, tailwind, shadcn) {
  const isTs = ext === "tsx";
  return `
  import React from 'react';
  ${shadcn ? 'import { cn } from "../lib/utils";' : ""}
  ${isTs ? "import type { FC } from 'react';" : ""}
  
  const Dashboard${isTs ? ": FC" : ""} = () => {
    const sampleData = [
      { id: 1, name: "Project A", status: "Active" },
      { id: 2, name: "Project B", status: "Pending" },
      { id: 3, name: "Project C", status: "Completed" },
    ];
  
    return (
      <div${tailwind ? `${shadcn ? ' className={cn("min-h-screen p-6 bg-gray-100")}' : ' className="min-h-screen p-6 bg-gray-100"'}` : ""}>
        ${
          tailwind
            ? `
        <h1${shadcn ? ' className={cn("text-3xl font-bold mb-6")}' : ' className="text-3xl font-bold mb-6"'}>Dashboard</h1>
        <div${
          shadcn
            ? ' className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6")}'
            : ' className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"'
        } >
          {sampleData.map((item${isTs ? ": any" : ""}) => (
            <div key={item.id}${shadcn ? ' className={cn("bg-white p-4 rounded-lg shadow-md")}' : ' className="bg-white p-4 rounded-lg shadow-md"'} >
              <h2${shadcn ? ' className={cn("text-xl font-semibold")}' : ' className="text-xl font-semibold"'} >{item.name}</h2>
              <p${shadcn ? ' className={cn("text-gray-600")}' : ' className="text-gray-600"'} >Status: ${"${item.status}"}</p>
            </div>
          ))}
        </div>
        `
            : `
        <h1>Dashboard</h1>
        <ul>
          {sampleData.map((item${isTs ? ": any" : ""}) => (
            <li key={item.id}>${"${item.name}"} - ${"${item.status}"}</li>
          ))}
        </ul>
        `
        }
      </div>
    );
  };
  
  export default Dashboard;
  `.trim();
}
