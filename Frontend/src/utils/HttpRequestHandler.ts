/**
 * ----------------------------------------------------------------------
 * HttpRequestHandler wraps Axios calls with shared toast handling and
 * convenience helpers for each HTTP verb used in the app.
 * ----------------------------------------------------------------------
 */

import type { AxiosError, AxiosResponse } from "axios";
import { gscSvc } from "../assets/axios/AxiosConfig";

// Toast configuration type
interface ToastConfig {
    severity: "success" | "error" | "info" | "warning";
    summary: string;
    detail: string;
}

// Global toast handler - can be set by the app to integrate with UI
let toastHandler: ((config: ToastConfig) => void) | null = null;

/**
 * Set the global toast handler for displaying notifications.
 * @param handler Function to display toast notifications.
 */
export const setToastHandler = (handler: (config: ToastConfig) => void): void => {
    toastHandler = handler;
};

const showToast = (config: ToastConfig): void => {
    if (toastHandler) {
        toastHandler(config);
    } else {
        console.log(`[${config.severity.toUpperCase()}] ${config.summary}: ${config.detail}`);
    }
};

const handleCatch = (error: AxiosError<{ detail?: string }>): void => {
    const errorMessage = error.response?.data?.detail || "Something went wrong";
    showToast({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
    });
};

/**
 * POST request with execution callback.
 */
export const postAndExecute = <T = unknown>(
    url: string,
    requestBody: object,
    executionFunc: (data: T) => void
): void => {
    gscSvc
        .post(url, requestBody)
        .then((response) => executionFunc(response.data))
        .catch(handleCatch);
};

/**
 * GET request with execution callback.
 */
export const getAndExecute = <T = unknown>(
    url: string,
    executionFunc: (data: T) => void
): void => {
    gscSvc
        .get(url)
        .then((response) => executionFunc(response.data))
        .catch(handleCatch);
};

/**
 * DELETE request with optional body and success toast message.
 */
export const deleteAndExecute = (
    url: string,
    requestBody: object,
    successMessage: string
): void => {
    gscSvc
        .delete(url, { data: requestBody })
        .then(() => {
            showToast({
                severity: "success",
                summary: "Success",
                detail: successMessage,
            });
        })
        .catch(handleCatch);
};

/**
 * PATCH request with execution callback.
 */
export const patchAndExecute = <T = unknown>(
    url: string,
    requestBody: object,
    executionFunc: (data: T) => void
): void => {
    gscSvc
        .patch(url, requestBody)
        .then((response) => executionFunc(response.data))
        .catch(handleCatch);
};

/**
 * PUT request with execution callback.
 */
export const putAndExecute = <T = unknown>(
    url: string,
    requestBody: object,
    executionFunc: (data: T) => void
): void => {
    gscSvc
        .put(url, requestBody)
        .then((response) => executionFunc(response.data))
        .catch(handleCatch);
};

/**
 * POST request for authentication (returns Promise).
 */
export const loginAndExecute = <T = unknown>(
    url: string,
    requestBody: object
): Promise<AxiosResponse<T>> => {
    return gscSvc.post<T>(url, requestBody);
};

/**
 * POST request to upload a file with FormData.
 */
export const postFormDataAndExecute = <T = unknown>(
    url: string,
    formData: FormData,
    executionFunc: (response: AxiosResponse<T> | null, error?: unknown) => void
): void => {
    gscSvc
        .post<T>(url, formData)
        .then((response) => executionFunc(response))
        .catch((error) => executionFunc(null, error));
};
