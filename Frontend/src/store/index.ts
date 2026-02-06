/**
 * Redux store configuration.
 */

import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../modules/appReducer";
import certificationsReducer from "../modules/certificationsSlice";
import advisoryReducer from "../modules/advisorySlice";

export const store = configureStore({
    reducer: {
        app: appReducer,
        certifications: certificationsReducer,
        advisory: advisoryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
