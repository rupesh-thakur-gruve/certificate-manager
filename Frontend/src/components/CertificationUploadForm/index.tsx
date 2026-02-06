/**
 * Certification Upload Form Component.
 * Uses React Hook Form with connect pattern.
 */

import React, { memo, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { connect, type ConnectedProps } from "react-redux";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
    CircularProgress,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import type { RootState, AppDispatch } from "../../store";
import { uploadNewCertification } from "../../modules/certificationsSlice";
import type { CertificationUpload } from "../../apis/APICalls";

// Form input types - single object for all form state
interface CertificationFormInputs {
    vendorOem: string;
    certificationName: string;
    credentialId: string;
    dateObtained: string;
    expiryDate: string;
}

// Map state to props
const mapStateToProps = (state: RootState) => ({
    isUploading: state.certifications.isLoading,
});

// Map dispatch to props
const mapDispatchToProps = (dispatch: AppDispatch) => ({
    uploadCertification: (data: CertificationUpload) =>
        dispatch(uploadNewCertification(data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps {
    onSuccess?: () => void;
}

type Props = PropsFromRedux & OwnProps;

const CertificationUploadFormComponent: React.FC<Props> = memo(
    ({ isUploading, uploadCertification, onSuccess }) => {
        // Single useState with object pattern
        const [state, setState] = useState({
            file: null as File | null,
            error: null as string | null,
            success: false,
        });

        const {
            control,
            handleSubmit,
            formState: { errors },
            reset,
        } = useForm<CertificationFormInputs>({
            defaultValues: {
                vendorOem: "",
                certificationName: "",
                credentialId: "",
                dateObtained: "",
                expiryDate: "",
            },
        });

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0] || null;
            setState((prev) => ({ ...prev, file, error: null }));
        };

        const onSubmit: SubmitHandler<CertificationFormInputs> = async (data) => {
            setState((prev) => ({ ...prev, error: null, success: false }));

            try {
                await uploadCertification({
                    vendor_oem: data.vendorOem,
                    certification_name: data.certificationName,
                    credential_id: data.credentialId || undefined,
                    date_obtained: data.dateObtained,
                    expiry_date: data.expiryDate || undefined,
                    document: state.file || undefined,
                });

                setState({ file: null, error: null, success: true });
                reset();
                onSuccess?.();
            } catch (err) {
                const error = err as Error;
                setState((prev) => ({
                    ...prev,
                    error: error.message || "Failed to upload certification",
                }));
            }
        };

        return (
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Upload New Certification
                </Typography>

                {state.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {state.error}
                    </Alert>
                )}

                {state.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Certification uploaded successfully!
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Controller
                        name="vendorOem"
                        control={control}
                        rules={{ required: "Vendor/OEM is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Vendor/OEM"
                                fullWidth
                                margin="normal"
                                error={!!errors.vendorOem}
                                helperText={errors.vendorOem?.message}
                                disabled={isUploading}
                                placeholder="e.g., AWS, Microsoft, Google"
                            />
                        )}
                    />

                    <Controller
                        name="certificationName"
                        control={control}
                        rules={{ required: "Certification name is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Certification Name"
                                fullWidth
                                margin="normal"
                                error={!!errors.certificationName}
                                helperText={errors.certificationName?.message}
                                disabled={isUploading}
                                placeholder="e.g., AWS Solutions Architect Associate"
                            />
                        )}
                    />

                    <Controller
                        name="credentialId"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Credential ID (Optional)"
                                fullWidth
                                margin="normal"
                                disabled={isUploading}
                            />
                        )}
                    />

                    <Controller
                        name="dateObtained"
                        control={control}
                        rules={{ required: "Date obtained is required" }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date Obtained"
                                type="date"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.dateObtained}
                                helperText={errors.dateObtained?.message}
                                disabled={isUploading}
                            />
                        )}
                    />

                    <Controller
                        name="expiryDate"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Expiry Date (Optional)"
                                type="date"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                disabled={isUploading}
                            />
                        )}
                    />

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <input
                            type="file"
                            id="cert-file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <label htmlFor="cert-file">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                disabled={isUploading}
                            >
                                {state.file ? state.file.name : "Upload Certificate File"}
                            </Button>
                        </label>
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isUploading}
                    >
                        {isUploading ? <CircularProgress size={24} /> : "Submit Certification"}
                    </Button>
                </Box>
            </Paper>
        );
    }
);

CertificationUploadFormComponent.displayName = "CertificationUploadForm";

export default connector(CertificationUploadFormComponent);