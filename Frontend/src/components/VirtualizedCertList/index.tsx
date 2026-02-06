/**
 * Certification List Component.
 * Renders list of certifications with filtering and memoization.
 * 
 * Note: For hackathon scope, using basic scrolling. 
 * For production with large datasets, implement react-window virtualization.
 */

import React, { useMemo } from "react";
import { connect, type ConnectedProps } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import type { RootState } from "@/store";
import CertificationCard from "@/components/CertificationCard";

// Map state to props
const mapStateToProps = (state: RootState) => ({
    certifications: state.certifications.items,
    filter: state.certifications.filter,
    isLoading: state.certifications.isLoading,
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
    onValidate?: (certId: string) => void;
    onDelete?: (certId: string) => void;
    isManager?: boolean;
}

type Props = PropsFromRedux & OwnProps;

const VirtualizedCertListComponent: React.FC<Props> = ({
    certifications,
    filter,
    isLoading,
    onValidate,
    onDelete,
    isManager = false,
}) => {
    // Memoize filtered list - default to empty array if certifications is undefined
    const filteredCerts = useMemo(() => {
        const certs = certifications || [];
        if (!filter) return certs;
        const lowerFilter = filter.toLowerCase();
        return certs.filter(
            (cert) =>
                cert.certification_name.toLowerCase().includes(lowerFilter) ||
                cert.vendor_oem.toLowerCase().includes(lowerFilter) ||
                cert.employee_name.toLowerCase().includes(lowerFilter)
        );
    }, [certifications, filter]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (filteredCerts.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <Typography color="text.secondary">
                    {filter ? "No certifications match your filter" : "No certifications found"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "calc(100vh - 300px)", minHeight: 400, overflow: "auto" }}>
            {filteredCerts.map((cert) => (
                <CertificationCard
                    key={cert.id}
                    certification={cert}
                    onValidate={onValidate}
                    onDelete={onDelete}
                    isManager={isManager}
                />
            ))}
        </Box>
    );
};

VirtualizedCertListComponent.displayName = "VirtualizedCertList";

const VirtualizedCertList = connector(VirtualizedCertListComponent);

export default VirtualizedCertList;
