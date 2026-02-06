/**
 * Root Layout Component.
 * Provides cross-tab auth sync and renders child routes.
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { useCrossTabAuth } from "../../hooks/useCrossTabAuth";

const RootLayout: React.FC = () => {
    // Initialize cross-tab auth sync
    useCrossTabAuth();

    return <Outlet />;
};

export default RootLayout;
