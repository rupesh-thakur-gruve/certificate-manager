/**
 * App Reducer - manages user state and auth.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse } from "../apis/APICalls";

interface AppState {
    isLoggedIn: boolean;
    userData: LoginResponse | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AppState = {
    isLoggedIn: false,
    userData: null,
    isLoading: false,
    error: null,
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<LoginResponse>) => {
            state.userData = action.payload;
            state.isLoggedIn = true;
            state.error = null;
        },
        resetUserLoggedIn: (state) => {
            state.userData = null;
            state.isLoggedIn = false;
            state.error = null;
        },
        setLoginStatus: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        clearUserData: (state) => {
            state.userData = null;
            state.isLoggedIn = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setUserData, resetUserLoggedIn, setLoginStatus, clearUserData, setLoading, setError } = appSlice.actions;
export default appSlice.reducer;
