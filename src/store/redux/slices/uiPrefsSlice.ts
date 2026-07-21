import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Density = "comfortable" | "compact";

interface UiPrefsState {
  density: Density;
}

const initialState: UiPrefsState = {
  density: "comfortable",
};

/**
 * Example Redux Toolkit slice. Redux is OPTIONAL in this boilerplate — reach for
 * it only when a complex, enterprise-scale flow benefits from its devtools,
 * middleware, and time-travel debugging. Simple global state should use Zustand.
 */
const uiPrefsSlice = createSlice({
  name: "uiPrefs",
  initialState,
  reducers: {
    setDensity: (state, action: PayloadAction<Density>) => {
      state.density = action.payload;
    },
    toggleDensity: (state) => {
      state.density = state.density === "comfortable" ? "compact" : "comfortable";
    },
  },
});

export const { setDensity, toggleDensity } = uiPrefsSlice.actions;
export const uiPrefsReducer = uiPrefsSlice.reducer;
