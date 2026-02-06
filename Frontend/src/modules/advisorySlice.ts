/**
 * Advisory Slice - manages AI advisory state.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AdvisoryRequest, CertRecommendation } from "../apis/APICalls";
import { getAdvisory } from "../apis/APICalls";

interface AdvisoryState {
    recommendations: CertRecommendation[];
    confidence: string;
    clarificationNeeded: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AdvisoryState = {
    recommendations: [],
    confidence: "",
    clarificationNeeded: null,
    isLoading: false,
    error: null,
};

// Async thunk - extract data from StandardApiResponse
export const fetchAdvisory = createAsyncThunk(
    "advisory/fetch",
    async (request: AdvisoryRequest) => {
        const response = await getAdvisory(request);
        return response.data;
    }
);

const advisorySlice = createSlice({
    name: "advisory",
    initialState,
    reducers: {
        clearAdvisory: (state) => {
            state.recommendations = [];
            state.confidence = "";
            state.clarificationNeeded = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAdvisory.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAdvisory.fulfilled, (state, action) => {
            state.isLoading = false;
            state.recommendations = action.payload.recommendations;
            state.confidence = action.payload.confidence;
            state.clarificationNeeded = action.payload.notes || null;
        });
        builder.addCase(fetchAdvisory.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message || "Failed to get recommendations";
        });
    },
});

export const { clearAdvisory } = advisorySlice.actions;
export default advisorySlice.reducer;
