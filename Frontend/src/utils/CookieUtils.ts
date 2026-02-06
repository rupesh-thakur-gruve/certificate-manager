/**
 * CookieUtils - Utility functions for cookie management.
 */

const AUTH_COOKIE_NAME = "access_token";

/**
 * Get the auth token from cookies or localStorage.
 * @returns The access token or null if not found.
 */
export const getAuthCookie = (): string | null => {
    // Try localStorage first (used by the app)
    const token = localStorage.getItem(AUTH_COOKIE_NAME);
    if (token) return token;

    // Fallback to cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === AUTH_COOKIE_NAME) {
            return decodeURIComponent(value);
        }
    }
    return null;
};

/**
 * Set the auth token in localStorage and optionally as a cookie.
 * @param token The access token to store.
 * @param expiresInDays Number of days until the cookie expires (default: 7).
 */
export const setAuthCookie = (token: string, expiresInDays: number = 7): void => {
    // Store in localStorage
    localStorage.setItem(AUTH_COOKIE_NAME, token);

    // Also set as cookie for cross-tab compatibility
    const expires = new Date();
    expires.setDate(expires.getDate() + expiresInDays);
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
};

/**
 * Remove the auth token from both localStorage and cookies.
 */
export const removeAuthCookie = (): void => {
    localStorage.removeItem(AUTH_COOKIE_NAME);
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Check if user is authenticated (has a valid token).
 * @returns True if auth token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
    return getAuthCookie() !== null;
};
