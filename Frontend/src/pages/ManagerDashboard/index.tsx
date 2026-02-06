/**
 * Manager Dashboard Page.
 * Refactored to match Tailwind CSS design.
 */

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { connect, type ConnectedProps } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
    fetchAllCertifications,
    setFilter,
    validateCert,
} from "../../modules/certificationsSlice";
import { useCrossTabAuth } from "../../hooks/useCrossTabAuth";
import { getAuditLogs } from "../../apis/APICalls";
import type { AuditLog } from "../../apis/APICalls";
import { formatDateTime } from "../../utils/dateUtils";

// Map state to props
const mapStateToProps = (state: RootState) => ({
    userData: state.app.userData,
    filter: state.certifications.filter,
    certifications: state.certifications.items,
    isLoadingCerts: state.certifications.isLoading,
});

// Map dispatch to props
const mapDispatchToProps = (dispatch: AppDispatch) => ({
    fetchCertifications: () => dispatch(fetchAllCertifications()),
    updateFilter: (filter: string) => dispatch(setFilter(filter)),
    validateCertification: (certId: string) => dispatch(validateCert(certId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

// Single state object pattern
interface ManagerState {
    activeView: "certificates" | "auditLogs"; // 'certificates' or 'auditLogs'
    auditLogs: AuditLog[];
    auditLoading: boolean;
}

const ManagerDashboardComponent: React.FC<PropsFromRedux> = ({
    userData,
    filter,
    certifications,
    isLoadingCerts,
    fetchCertifications,
    updateFilter,
    validateCertification,
}) => {
    const { handleLogout } = useCrossTabAuth();

    // Single useState with object pattern
    const [state, setState] = useState<ManagerState>({
        activeView: "certificates",
        auditLogs: [],
        auditLoading: false,
    });

    // Update state helper
    const updateState = useCallback((updates: Partial<ManagerState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const loadAuditLogs = useCallback(async () => {
        updateState({ auditLoading: true });
        try {
            const response = await getAuditLogs(100);
            const logs = response.data?.logs || response.data || [];
            updateState({ auditLogs: Array.isArray(logs) ? logs : [], auditLoading: false });
        } catch {
            updateState({ auditLogs: [], auditLoading: false });
        }
    }, [updateState]);

    useEffect(() => {
        fetchCertifications();
    }, [fetchCertifications]);

    useEffect(() => {
        if (state.activeView === "auditLogs") {
            loadAuditLogs();
        }
    }, [state.activeView, loadAuditLogs]);

    const handleValidate = useCallback(
        (certId: string) => {
            validateCertification(certId);
        },
        [validateCertification]
    );

    // Filter Logic
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

    const kpiStats = useMemo(() => {
        const total = certifications?.length || 0;
        const active = certifications?.filter(c => c.status === "active").length || 0;
        const pending = certifications?.filter(c => c.status === "in_progress").length || 0;
        const expired = certifications?.filter(c => c.status === "expired").length || 0;
        return { total, active, pending, expired };
    }, [certifications]);

    const getStatusColorClass = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "in_progress": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "expired": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300";
        }
    };

    const getActionColorDetails = (action: string) => {
        switch (action) {
            case "UPLOAD": return { icon: "upload_file", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" };
            case "VALIDATE": return { icon: "check_circle", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" };
            case "DELETE": return { icon: "delete", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" };
            default: return { icon: "info", bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-600 dark:text-slate-400" };
        }
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden font-display">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shrink-0 z-20">
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">CertTrack</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Enterprise Edition</p>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
                    <div className="pt-2 pb-1 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</div>

                    <button
                        onClick={() => updateState({ activeView: "certificates" })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors group ${state.activeView === "certificates" ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/5" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                        <span className={`material-symbols-outlined ${state.activeView === "certificates" ? "fill" : "text-slate-400 group-hover:text-primary"} transition-colors`}>verified_user</span>
                        <span className="text-sm">Certificates</span>
                    </button>

                    <div className="pt-4 pb-1 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance</div>
                    <button
                        onClick={() => updateState({ activeView: "auditLogs" })}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors group ${state.activeView === "auditLogs" ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/5" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                        <span className={`material-symbols-outlined ${state.activeView === "auditLogs" ? "fill" : "text-slate-400 group-hover:text-primary"} transition-colors`}>receipt_long</span>
                        <span className="text-sm font-medium">Audit Logs</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                        <div className="relative size-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-slate-500">
                            {/* Placeholder for user image if not available */}
                            <span className="material-symbols-outlined text-lg">person</span>
                            <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userData?.user.name || "Manager"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userData?.user.role || "Role"}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 z-10">
                    <div className="flex items-center gap-6">
                        <button className="md:hidden text-slate-500 hover:text-slate-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">Dashboard</h2>
                        {state.activeView === "certificates" && (
                            <div className="relative hidden lg:block w-96">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                </span>
                                <input
                                    className="pl-10 pr-4 py-2 w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="Search certificates, employees, or IDs..."
                                    type="text"
                                    value={filter}
                                    onChange={(e) => updateFilter(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                            <span className="text-xs font-medium text-slate-500">Role:</span>
                            <div className="relative group cursor-pointer">
                                <button className="flex items-center gap-1 text-sm font-bold text-primary">
                                    Manager
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors ml-2" title="Logout">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background-dark p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Active Card */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined">verified</span>
                                    </div>
                                    {/* <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full dark:bg-green-900/30">+2.4%</span> */}
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Certifications</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{kpiStats.active}</p>
                            </div>
                            {/* Pending Card */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-l-4 border-l-amber-500 border-t border-r border-b border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                        <span className="material-symbols-outlined">pending_actions</span>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full dark:bg-amber-900/40">Action Needed</span>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pending Approval</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{kpiStats.pending}</p>
                            </div>
                            {/* Expired Card */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-16 bg-red-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">warning</span>
                                    </div>
                                </div>
                                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Expired</h3>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight relative z-10">{kpiStats.expired}</p>
                            </div>
                        </div>

                        {state.activeView === "certificates" && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Main Table Section */}
                                <div className="xl:col-span-2 flex flex-col gap-6">
                                    {/* Section Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certification Inventory</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage and review team certifications</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={fetchCertifications}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                                Refresh
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                                    <tr>
                                                        <th className="px-6 py-4">Employee</th>
                                                        <th className="px-6 py-4">Certification Name</th>
                                                        <th className="px-6 py-4">Provider</th>
                                                        <th className="px-6 py-4">Expiry Date</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                    {isLoadingCerts ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading certifications...</td>
                                                        </tr>
                                                    ) : filteredCerts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No certifications found.</td>
                                                        </tr>
                                                    ) : (
                                                        filteredCerts.map((cert) => (
                                                            <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cert.employee_name}</td>
                                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{cert.certification_name}</td>
                                                                <td className="px-6 py-4 text-slate-500">{cert.vendor_oem}</td>
                                                                <td className={`px-6 py-4 font-medium ${cert.status === "expired" ? "text-red-600" : "text-slate-500"}`}>{cert.expiry_date}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(cert.status)}`}>
                                                                        {cert.status === "in_progress" ? "Pending" : cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {cert.status === "in_progress" && (
                                                                        <button
                                                                            onClick={() => handleValidate(cert.id)}
                                                                            className="text-primary hover:text-primary-dark font-medium text-xs mr-2"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Sidebar / AI Advisory */}
                                <div className="xl:col-span-1 space-y-6">
                                    {/* AI Panel */}
                                    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-900/30 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-20 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                        <div className="p-5 border-b border-indigo-50 dark:border-indigo-900/20 flex items-center gap-2 relative z-10">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-indigo-600 dark:text-indigo-400">
                                                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">AI Advisory Insights</h3>
                                        </div>
                                        <div className="p-5 space-y-5 relative z-10">
                                            {/* Insight 1 placeholder */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">lightbulb</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Compliance Warning</p>
                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                            Three critical certifications are expiring next week.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Action</span>
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">High Priority</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">Notify employees to renew immediately.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Chart / Quick Stats */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Compliance Score</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-4xl font-bold text-primary">85%</span>
                                                <span className="text-xs text-slate-500">Overall Health</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {state.activeView === "auditLogs" && (
                            <div className="pt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Audit Logs</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">System activities and compliance checks</p>
                                    </div>
                                    <button
                                        onClick={loadAuditLogs}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${state.auditLoading ? 'animate-spin' : ''}`}>refresh</span>
                                        Refresh
                                    </button>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                    {(state.auditLogs || []).map((log) => {
                                        const { icon, bg, text } = getActionColorDetails(log.action);
                                        return (
                                            <div key={log.id} className="flex items-center gap-4 text-sm p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                                                <div className={`p-2 rounded-full ${bg} ${text}`}>
                                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 dark:text-white">{log.details}</p>
                                                    <p className="text-slate-500 text-xs">by {log.user_name} • {formatDateTime(log.timestamp)}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">ID: {log.id.substring(0, 8)}</span>
                                            </div>
                                        );
                                    })}
                                    {!state.auditLoading && state.auditLogs.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">No audit logs found.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

ManagerDashboardComponent.displayName = "ManagerDashboard";

export default connector(ManagerDashboardComponent);