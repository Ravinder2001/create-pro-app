import fs from "fs-extra";
import path from "path";

export async function createStore(projectDir, ext, authentication, persist) {
  const storeDir = path.join(projectDir, "src", "store");
  await fs.ensureDir(storeDir);

  await fs.writeFile(path.join(storeDir, `store.${ext}`), getReduxStoreTemplate(ext, persist, authentication));
  if (authentication) {
    await fs.writeFile(path.join(storeDir, `userSlice.${ext}`), getUserSliceTemplate(ext));
  } else {
    await fs.writeFile(path.join(storeDir, `counterSlice.${ext}`), getCounterSliceTemplate(ext));
  }
}

function getReduxStoreTemplate(ext, persist, authentication) {
  return `
import { configureStore } from '@reduxjs/toolkit';
${persist ? "import { persistStore, persistReducer } from 'redux-persist';\nimport storage from 'redux-persist/lib/storage';" : ""}
import ${authentication ? "userSlice" : "counterSlice"} from './${authentication ? "userSlice" : "counterSlice"}';

const persistConfig = ${persist ? "{ key: 'root', storage }" : "{}"};

const rootReducer = {
  ${authentication ? "user" : "counter"}: ${
    persist ? `persistReducer(persistConfig, ${authentication ? "userSlice" : "counterSlice"})` : authentication ? "userSlice" : "counterSlice"
  },
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

${persist ? "export const persistor = persistStore(store);" : ""}
`.trim();
}

function getUserSliceTemplate(ext) {
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
`.trim();
}

function getCounterSliceTemplate(ext) {
  return `
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`.trim();
}
