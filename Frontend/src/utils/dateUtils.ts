/**
 * Date utilities.
 */

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getDaysUntilExpiry = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

export const getStatusColor = (status: string): "success" | "error" | "warning" | "info" => {
    switch (status) {
        case "active":
            return "success";
        case "expired":
            return "error";
        case "in_progress":
            return "warning";
        case "never_expires":
            return "info";
        default:
            return "info";
    }
};
