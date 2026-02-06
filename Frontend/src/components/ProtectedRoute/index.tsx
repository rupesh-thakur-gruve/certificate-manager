/**
 * Protected Route Component.
 * Uses Redux connect pattern for role-based access control.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { connect, type ConnectedProps } from "react-redux";
import type { RootState } from "../../store";

// Map state to props
const mapStateToProps = (state: RootState) => ({
    userData: state.app.userData,
    isLoggedIn: state.app.isLoggedIn,
});

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

type Props = PropsFromRedux & OwnProps;

const ProtectedRouteComponent: React.FC<Props> = ({
    allowedRoles,
    children,
    userData,
    isLoggedIn,
}) => {
    if (!isLoggedIn || !userData) {
        return <Navigate to="/login" replace />;
    }

    const userRole = userData.user.role;

    if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        if (userRole === "manager") {
            return <Navigate to="/manager-dashboard" replace />;
        }
        return <Navigate to="/employee-dashboard" replace />;
    }

    return <>{children}</>;
};

ProtectedRouteComponent.displayName = "ProtectedRoute";

export default connector(ProtectedRouteComponent);