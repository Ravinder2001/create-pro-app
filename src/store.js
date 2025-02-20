async function createStore(projectDir, ext, stateManagement, persist, authentication) {
  const storeDir = path.join(projectDir, "src", "store");
  await fs.ensureDir(storeDir);

  if (stateManagement === "Redux Toolkit") {
    await fs.writeFile(path.join(storeDir, `store.${ext}`), getReduxStoreTemplate(ext, persist));
    if (authentication) {
      await fs.writeFile(path.join(storeDir, `userSlice.${ext}`), getUserSliceTemplate(ext, persist));
    }
  } else if (stateManagement === "Zustand") {
    await fs.writeFile(path.join(storeDir, `useStore.${ext}`), getZustandStoreTemplate(ext, persist, authentication));
  }
}

function getReduxStoreTemplate(ext, persist) {
  return `
  import { configureStore } from '@reduxjs/toolkit';
  ${persist ? "import { persistStore, persistReducer } from 'redux-persist';" : ""}
  ${persist ? "import storage from 'redux-persist/lib/storage';" : ""}
  import userSlice from './userSlice';
  
  const persistConfig = {
    key: 'root',
    storage,
  };
  
  const rootReducer = {
    user: ${persist ? "persistReducer(persistConfig, userSlice)" : "userSlice"},
  };
  
  export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
  
  ${persist ? "export const persistor = persistStore(store);" : ""}
  `;
}

function getUserSliceTemplate(ext, persist) {
  return `
  import { createSlice } from '@reduxjs/toolkit';
  
  const userSlice = createSlice({
    name: 'user',
    initialState: {
      id: null,
      isAuthenticated: false,
    },
    reducers: {
      setUser: (state, action) => {
        state.id = action.payload.id;
        state.isAuthenticated = true;
      },
      clearUser: (state) => {
        state.id = null;
        state.isAuthenticated = false;
      },
    },
  });
  
  export const { setUser, clearUser } = userSlice.actions;
  export default userSlice.reducer;
  `;
}

function getZustandStoreTemplate(ext, persist, authentication) {
  return `
  import { create } from 'zustand';
  ${persist ? "import { persist } from 'zustand/middleware';" : ""}
  
  const useStore = create(
    ${persist ? "persist(" : ""}
      (set) => ({
        ${authentication ? "id: null," : ""}
        ${authentication ? "isAuthenticated: false," : ""}
        ${authentication ? `setUser: (id) => set({ id, isAuthenticated: true }),` : ""}
        ${authentication ? "clearUser: () => set({ id: null, isAuthenticated: false })," : ""}
      }),
      ${persist ? "{ name: 'app-storage' }" : ""}
    ${persist ? ")" : ""}
  );
  
  export default useStore;
  `;
}

// Update createProjectStructure to call createStore
async function createProjectStructure(projectDir, ext, authentication, stateManagement, persist) {
  // ... existing code ...
  await createStore(projectDir, ext, stateManagement, persist, authentication);
}
