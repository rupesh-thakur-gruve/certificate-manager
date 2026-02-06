/**
 * ----------------------------------------------------------------------
 * APICalls centralizes REST helpers for auth, certifications, advisory,
 * and audit operations so components/hooks can consume a single surface.
 * ----------------------------------------------------------------------
 */

import type { AxiosResponse } from "axios";
import { gscSvc } from "../assets/axios/AxiosConfig";
import {
    getAndExecute,
    postAndExecute,
    deleteAndExecute,
    loginAndExecute,
    postFormDataAndExecute,
} from "../utils/HttpRequestHandler";

// Standard API response wrapper
export interface StandardApiResponse<T = unknown> {
    data: T;
    status: number;
    message?: string;
    detail?: string;
}

const toStandardApiResponse = <T>(response: AxiosResponse<T>): StandardApiResponse<T> => {
    const { data, status } = response;
    const responseMessage = (data as { message?: string } | undefined)?.message;
    const responseDetail = (data as { detail?: string } | undefined)?.detail;
    return { data, status, message: responseMessage, detail: responseDetail };
};

// ============== Type Definitions ==============

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: "employee" | "manager";
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: UserData;
}

export interface RegisterResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    message: string;
}

export interface Certification {
    id: string;
    employee_id: string;
    employee_name: string;
    certification_name: string;
    vendor_oem: string;
    credential_id?: string;
    date_obtained: string;
    expiry_date?: string;
    status: "active" | "expired" | "in_progress" | "never_expires";
    document_url?: string;
    validated_by?: string;
    validated_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CertificationUpload {
    certification_name: string;
    vendor_oem: string;
    credential_id?: string;
    date_obtained: string;
    expiry_date?: string;
    never_expires?: boolean;
    document?: File;
}

export interface CertificationsResponse {
    certifications: Certification[];
    total: number;
}

export interface CertificationResponse {
    certification: Certification;
    message: string;
}

export interface AdvisoryRequest {
    skills: string[];
    current_certifications: string[];
}

export interface CertRecommendation {
    certification_name: string;
    vendor: string;
    reason: string;
    priority: "high" | "medium" | "low";
    estimated_prep_time: string;
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface AdvisoryResponse {
    recommendations: CertRecommendation[];
    confidence: string;
    notes?: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    user_name: string;
    details?: string;
    timestamp: string;
}

export interface AuditLogsResponse {
    logs: AuditLog[];
    total: number;
}

// ============== Auth APIs ==============

/**
 * POST request to login a user.
 */
export const login = async (
    email: string,
    password: string
): Promise<StandardApiResponse<LoginResponse>> => {
    const response = await loginAndExecute<LoginResponse>("/auth/login", {
        email,
        password,
    });
    return toStandardApiResponse(response);
};

/**
 * POST request to register a new user.
 */
export const register = async (
    email: string,
    password: string,
    name: string,
    role: "employee" | "manager" = "employee"
): Promise<StandardApiResponse<RegisterResponse>> => {
    const response = await loginAndExecute<RegisterResponse>("/auth/register", {
        email,
        password,
        name,
        role,
    });
    return toStandardApiResponse(response);
};

// ============== Certification APIs ==============

/**
 * GET request to fetch current user's certifications.
 */
export const getMyCertifications = async (): Promise<StandardApiResponse<CertificationsResponse>> => {
    const response = await gscSvc.get<CertificationsResponse>("/certs/my");
    return toStandardApiResponse(response);
};

/**
 * GET request to fetch all certifications (manager only).
 */
export const getAllCertifications = async (): Promise<StandardApiResponse<CertificationsResponse>> => {
    const response = await gscSvc.get<CertificationsResponse>("/certs");
    return toStandardApiResponse(response);
};

/**
 * GET request to fetch certifications with callback.
 */
export const fetchMyCertificationsWithCallback = (
    executionFunc: (data: CertificationsResponse) => void
): void => {
    getAndExecute<CertificationsResponse>("/certs/my", executionFunc);
};

/**
 * GET request to fetch all certifications with callback.
 */
export const fetchAllCertificationsWithCallback = (
    executionFunc: (data: CertificationsResponse) => void
): void => {
    getAndExecute<CertificationsResponse>("/certs", executionFunc);
};

/**
 * POST request to upload a new certification.
 */
export const uploadCertification = async (
    data: CertificationUpload
): Promise<StandardApiResponse<CertificationResponse>> => {
    const formData = new FormData();
    formData.append("certification_name", data.certification_name);
    formData.append("vendor_oem", data.vendor_oem);
    formData.append("date_obtained", data.date_obtained);

    if (data.credential_id) {
        formData.append("credential_id", data.credential_id);
    }
    if (data.expiry_date) {
        formData.append("expiry_date", data.expiry_date);
    }
    if (data.never_expires) {
        formData.append("never_expires", "true");
    }
    if (data.document) {
        formData.append("document", data.document);
    }

    const response = await gscSvc.post<CertificationResponse>("/certs", formData);
    return toStandardApiResponse(response);
};

/**
 * POST request to upload certification with callback.
 */
export const uploadCertificationWithCallback = (
    formData: FormData,
    executionFunc: (response: AxiosResponse<CertificationResponse> | null, error?: unknown) => void
): void => {
    postFormDataAndExecute<CertificationResponse>("/certs", formData, executionFunc);
};

/**
 * POST request to validate a certification (manager only).
 */
export const validateCertification = async (
    certId: string
): Promise<StandardApiResponse<CertificationResponse>> => {
    const response = await gscSvc.post<CertificationResponse>(`/certs/${certId}/validate`);
    return toStandardApiResponse(response);
};

/**
 * POST request to validate certification with callback.
 */
export const validateCertificationWithCallback = (
    certId: string,
    executionFunc: (data: CertificationResponse) => void
): void => {
    postAndExecute<CertificationResponse>(`/certs/${certId}/validate`, {}, executionFunc);
};

/**
 * DELETE request to remove a certification (manager only).
 */
export const deleteCertification = async (
    certId: string
): Promise<StandardApiResponse<{ message: string }>> => {
    const response = await gscSvc.delete<{ message: string }>(`/certs/${certId}`);
    return toStandardApiResponse(response);
};

/**
 * DELETE request to remove certification with toast.
 */
export const deleteCertificationWithToast = (
    certId: string
): void => {
    deleteAndExecute(`/certs/${certId}`, {}, "Certification deleted successfully");
};

// ============== Advisory APIs ==============

/**
 * POST request to get AI advisory recommendations.
 */
export const getAdvisory = async (
    request: AdvisoryRequest
): Promise<StandardApiResponse<AdvisoryResponse>> => {
    const response = await gscSvc.post<AdvisoryResponse>("/advisory", request);
    return toStandardApiResponse(response);
};

/**
 * POST request to get advisory with callback.
 */
export const getAdvisoryWithCallback = (
    request: AdvisoryRequest,
    executionFunc: (data: AdvisoryResponse) => void
): void => {
    postAndExecute<AdvisoryResponse>("/advisory", request, executionFunc);
};

// ============== Audit APIs ==============

/**
 * GET request to fetch audit logs (manager only).
 */
export const getAuditLogs = async (
    limit: number = 100
): Promise<StandardApiResponse<AuditLogsResponse>> => {
    const response = await gscSvc.get<AuditLogsResponse>(`/audit?limit=${limit}`);
    return toStandardApiResponse(response);
};

/**
 * GET request to fetch audit logs with callback.
 */
export const getAuditLogsWithCallback = (
    executionFunc: (data: AuditLogsResponse) => void,
    limit: number = 100
): void => {
    getAndExecute<AuditLogsResponse>(`/audit?limit=${limit}`, executionFunc);
};
