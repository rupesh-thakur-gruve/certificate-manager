/**
 * AxiosConfig - Centralized Axios instance configuration.
 * Creates axios instances with automatic auth token injection.
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getAuthCookie } from "@/utils/CookieUtils";

/**
 * Creates a new Axios instance that can be used to make requests to the API.
 * The instance will automatically add the current user's access token to the
 * Authorization header of each request.
 * @param baseUrl The base URL of the API to make requests to.
 * @param cred Whether to include credentials in the request.
 * @returns An instance of Axios that can be used to make requests.
 */
const createAxiosInstance = (
    baseUrl: string,
    cred: boolean = true
): AxiosInstance => {
    const instance: AxiosInstance = axios.create({
        baseURL: baseUrl,
        withCredentials: cred,
        maxRedirects: 10,
    });

    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const accessToken = getAuthCookie();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Dynamically set Content-Type based on the request URL
            if (config.url?.includes("/file/upload") || config.url?.includes("/certs")) {
                config.headers["Content-Type"] = "multipart/form-data";
            } else {
                config.headers["Content-Type"] = "application/json";
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
};

// Use empty string to use relative URLs (works with Vite proxy)
const apiUrl = import.meta.env.VITE_API_BASE_URL as string || "";
export const gscSvc: AxiosInstance = createAxiosInstance(apiUrl, true);
