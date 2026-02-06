/**
 * Certifications Slice - manages certifications state.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Certification, CertificationUpload } from "../apis/APICalls";
import { getMyCertifications, getAllCertifications, uploadCertification, validateCertification } from "../apis/APICalls";

interface CertificationsState {
    items: Certification[];
    filter: string;
    isLoading: boolean;
    error: string | null;
}

const initialState: CertificationsState = {
    items: [],
    filter: "",
    isLoading: false,
    error: null,
};

// Async thunks - extract certifications array from response
export const fetchMyCertifications = createAsyncThunk(
    "certifications/fetchMy",
    async () => {
        const response = await getMyCertifications();
        return response.data.certifications;
    }
);

export const fetchAllCertifications = createAsyncThunk(
    "certifications/fetchAll",
    async () => {
        const response = await getAllCertifications();
        return response.data.certifications;
    }
);

export const uploadNewCertification = createAsyncThunk(
    "certifications/upload",
    async (data: CertificationUpload) => {
        const response = await uploadCertification(data);
        return response.data.certification;
    }
);

export const validateCert = createAsyncThunk(
    "certifications/validate",
    async (certId: string) => {
        const response = await validateCertification(certId);
        return response.data.certification;
    }
);

const certificationsSlice = createSlice({
    name: "certifications",
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
        clearCertifications: (state) => {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        // Fetch my certifications
        builder.addCase(fetchMyCertifications.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMyCertifications.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchMyCertifications.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message || "Failed to fetch certifications";
        });

        // Fetch all certifications
        builder.addCase(fetchAllCertifications.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchAllCertifications.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchAllCertifications.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message || "Failed to fetch certifications";
        });

        // Upload certification
        builder.addCase(uploadNewCertification.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(uploadNewCertification.fulfilled, (state, action) => {
            state.isLoading = false;
            state.items.unshift(action.payload);
        });
        builder.addCase(uploadNewCertification.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.error.message || "Failed to upload certification";
        });

        // Validate certification
        builder.addCase(validateCert.fulfilled, (state, action) => {
            const index = state.items.findIndex((c) => c.id === action.payload.id);
            if (index >= 0) {
                state.items[index] = action.payload;
            }
        });
    },
});

export const { setFilter, clearCertifications } = certificationsSlice.actions;
export default certificationsSlice.reducer;
