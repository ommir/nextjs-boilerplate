import { configureStore } from "@reduxjs/toolkit";
import { uiPrefsReducer } from "./slices/uiPrefsSlice";

/** Factory so each request/render gets an isolated store during SSR. */
export function makeStore() {
  return configureStore({
    reducer: {
      uiPrefs: uiPrefsReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
