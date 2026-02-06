/**
 * Certification Card Component.
 * Memoized with custom comparison for performance.
 */

import React, { memo, useMemo, useCallback } from "react";
import {
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Box,
    Tooltip,
} from "@mui/material";
import {
    CheckCircle,
    Error,
    Schedule,
    AllInclusive,
    Edit,
    Delete,
} from "@mui/icons-material";
import type { Certification } from "@/apis/APICalls";
import { formatDate, getDaysUntilExpiry, getStatusColor } from "@/utils/dateUtils";

interface Props {
    certification: Certification;
    onEdit?: (cert: Certification) => void;
    onDelete?: (certId: string) => void;
    onValidate?: (certId: string) => void;
    showActions?: boolean;
    isManager?: boolean;
}

const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
        case "active":
            return <CheckCircle fontSize="small" />;
        case "expired":
            return <Error fontSize="small" />;
        case "in_progress":
            return <Schedule fontSize="small" />;
        case "never_expires":
            return <AllInclusive fontSize="small" />;
        default:
            return undefined;
    }
};

const CertificationCard: React.FC<Props> = memo(
    ({ certification, onEdit, onDelete, onValidate, showActions = true, isManager = false }) => {
        // Memoized callbacks
        const handleEdit = useCallback(() => {
            onEdit?.(certification);
        }, [onEdit, certification]);

        const handleDelete = useCallback(() => {
            onDelete?.(certification.id);
        }, [onDelete, certification.id]);

        const handleValidate = useCallback(() => {
            onValidate?.(certification.id);
        }, [onValidate, certification.id]);

        // Memoized computed values
        const formattedDate = useMemo(
            () => formatDate(certification.date_obtained),
            [certification.date_obtained]
        );

        const expiryInfo = useMemo(() => {
            if (!certification.expiry_date) return null;
            const days = getDaysUntilExpiry(certification.expiry_date);
            if (days === null) return null;
            if (days < 0) return `Expired ${Math.abs(days)} days ago`;
            if (days === 0) return "Expires today";
            return `Expires in ${days} days`;
        }, [certification.expiry_date]);

        return (
            <Card
                sx={{
                    mb: 2,
                    borderLeft: 4,
                    borderColor: `${getStatusColor(certification.status)}.main`,
                }}
            >
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                            <Typography variant="h6" gutterBottom>
                                {certification.certification_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {certification.vendor_oem}
                            </Typography>
                            {certification.credential_id && (
                                <Typography variant="body2" color="text.secondary">
                                    ID: {certification.credential_id}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Obtained: {formattedDate}
                            </Typography>
                            {expiryInfo && (
                                <Typography
                                    variant="body2"
                                    color={certification.status === "expired" ? "error" : "text.secondary"}
                                >
                                    {expiryInfo}
                                </Typography>
                            )}
                            {isManager && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Employee: {certification.employee_name}
                                </Typography>
                            )}
                        </Box>

                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                            <Chip
                                icon={getStatusIcon(certification.status)}
                                label={certification.status.replace("_", " ")}
                                color={getStatusColor(certification.status)}
                                size="small"
                            />

                            {showActions && (
                                <Box>
                                    {isManager && certification.status === "in_progress" && (
                                        <Tooltip title="Validate">
                                            <IconButton size="small" color="success" onClick={handleValidate}>
                                                <CheckCircle />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {onEdit && (
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={handleEdit}>
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {isManager && onDelete && (
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={handleDelete}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    },
    // Custom comparison function for memo
    (prevProps, nextProps) => {
        return (
            prevProps.certification.id === nextProps.certification.id &&
            prevProps.certification.status === nextProps.certification.status &&
            prevProps.certification.validated_at === nextProps.certification.validated_at &&
            prevProps.isManager === nextProps.isManager
        );
    }
);

export default CertificationCard;
