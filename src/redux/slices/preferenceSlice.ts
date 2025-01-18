import { createSlice } from '@reduxjs/toolkit';

interface PreferencesState {
  darkMode: boolean;
}

const initialState: PreferencesState = {
    darkMode: false, // Default to light mode
  };


  const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
      toggleDarkMode(state) {
        state.darkMode = !state.darkMode;
      },
    },
  });


  export const { toggleDarkMode } = preferencesSlice.actions;
  export default preferencesSlice.reducer;