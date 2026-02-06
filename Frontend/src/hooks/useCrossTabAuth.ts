/**
 * useCrossTabAuth - Hook for syncing authentication state across browser tabs.
 * Uses localStorage events and CookieUtils for token management.
 */

import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoginStatus, clearUserData } from "../modules/appReducer";
import { setAuthCookie, removeAuthCookie, getAuthCookie } from "../utils/CookieUtils";

const AUTH_EVENT_KEY = "auth_event";

interface AuthEvent {
    type: "login" | "logout";
    timestamp: number;
}

export const useCrossTabAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle login - stores token and broadcasts to other tabs
    const handleLogin = useCallback(
        (token: string) => {
            setAuthCookie(token);
            dispatch(setLoginStatus(true));

            // Broadcast login event to other tabs
            const event: AuthEvent = { type: "login", timestamp: Date.now() };
            localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(event));
        },
        [dispatch]
    );

    // Handle logout - clears token and broadcasts to other tabs
    const handleLogout = useCallback(() => {
        removeAuthCookie();
        dispatch(clearUserData());
        dispatch(setLoginStatus(false));

        // Broadcast logout event to other tabs
        const event: AuthEvent = { type: "logout", timestamp: Date.now() };
        localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify(event));

        navigate("/login");
    }, [dispatch, navigate]);

    // Check initial auth state on mount
    useEffect(() => {
        const token = getAuthCookie();
        if (token) {
            dispatch(setLoginStatus(true));
        }
    }, [dispatch]);

    // Listen for auth events from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === AUTH_EVENT_KEY && e.newValue) {
                try {
                    const event: AuthEvent = JSON.parse(e.newValue);

                    if (event.type === "logout") {
                        // Another tab logged out - sync this tab
                        dispatch(clearUserData());
                        dispatch(setLoginStatus(false));
                        navigate("/login");
                    } else if (event.type === "login") {
                        // Another tab logged in - sync this tab
                        dispatch(setLoginStatus(true));
                    }
                } catch {
                    console.warn("Failed to parse auth event");
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [dispatch, navigate]);

    return {
        handleLogin,
        handleLogout,
        isAuthenticated: getAuthCookie() !== null,
    };
};
