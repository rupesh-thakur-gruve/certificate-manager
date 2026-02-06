/**
 * Employee Dashboard Page.
 * Refactored to match "CertTrack Enterprise Portal" Tailwind design.
 */

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { connect, type ConnectedProps } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchMyCertifications, setFilter } from "../../modules/certificationsSlice";
import { useCrossTabAuth } from "../../hooks/useCrossTabAuth";
import AddNewCertificationModal from "../../components/AddNewCertificationModal";
import Sidebar from "../../components/Dashboard/Sidebar";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import StatsGrid from "../../components/Dashboard/StatsGrid";
import CertificationsTable from "../../components/Dashboard/CertificationsTable";
import translations from "../../locales/en/common.json";

// Map state to props
const mapStateToProps = (state: RootState) => ({
    userData: state.app.userData,
    filter: state.certifications.filter,
    certifications: state.certifications.items,
    loading: state.certifications.isLoading,
});

// Map dispatch to props
const mapDispatchToProps = (dispatch: AppDispatch) => ({
    fetchCertifications: () => dispatch(fetchMyCertifications()),
    updateFilter: (filter: string) => dispatch(setFilter(filter)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

// Dashboard State
interface DashboardState {
    showUploadModal: boolean;
    activeView: "dashboard" | "certifications" | "career" | "learning";
}

const EmployeeDashboardComponent: React.FC<PropsFromRedux> = ({
    userData,
    filter,
    certifications,
    loading,
    fetchCertifications,
    updateFilter,
}) => {
    const { handleLogout } = useCrossTabAuth();

    const [state, setState] = useState<DashboardState>({
        showUploadModal: false,
        activeView: "dashboard",
    });

    const updateState = useCallback((updates: Partial<DashboardState>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        fetchCertifications();
    }, [fetchCertifications]);

    // Derived Statistics
    const stats = useMemo(() => {
        if (!certifications) return { total: 0, active: 0, expiring: 0, complianceScore: 85 };
        const total = certifications.length;
        const active = certifications.filter(c => c.status === "active").length;
        const expiring = certifications.filter(c => c.status === "active" && c.expiry_date).length; // Simplified logic for demo
        const complianceScore = 85; // Hardcoded for demo matching design
        return { total, active, expiring, complianceScore };
    }, [certifications]);

    const filteredCerts = useMemo(() => {
        if (!certifications) return [];
        if (!filter) return certifications;
        const lowerFilter = filter.toLowerCase();
        return certifications.filter(c =>
            c.certification_name.toLowerCase().includes(lowerFilter) ||
            c.vendor_oem.toLowerCase().includes(lowerFilter)
        );
    }, [certifications, filter]);

    const getStatusColorClass = (status: string) => {
        switch (status) {
            case "active": return "bg-primary/10 text-primary";
            case "in_progress": return "bg-accent-yellow/10 text-accent-yellow";
            case "expired": return "bg-accent-orange/10 text-accent-orange";
            default: return "bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300";
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-200">
            <Sidebar 
                activeView={state.activeView}
                setActiveView={(view) => updateState({ activeView: view })}
                handleLogout={handleLogout}
                userData={userData}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
                <DashboardHeader 
                    filter={filter}
                    updateFilter={updateFilter}
                />

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">{translations.employeeDashboard.welcome} {userData?.user.name ? userData.user.name.split(' ')[0] : 'User'} 👋</h2>
                                <p className="text-sub-light dark:text-sub-dark mt-1" dangerouslySetInnerHTML={{ __html: translations.employeeDashboard.compliantMessage.replace('{complianceScore}', `<span class="text-primary font-semibold">${stats.complianceScore}</span>`) }}></p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-semibold text-text-main-light dark:text-text-main-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-lg">upload_file</span>
                                    {translations.employeeDashboard.importHistory}
                                </button>
                                <button
                                    onClick={() => updateState({ showUploadModal: true })}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-text rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    {translations.employeeDashboard.addNewCert}
                                </button>
                            </div>
                        </div>

                        <StatsGrid stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content Column */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* Resume Upload Zone */}
                                <div
                                    onClick={() => updateState({ showUploadModal: true })}
                                    className="bg-surface-light dark:bg-surface-dark border-2 border-dashed border-primary/30 dark:border-primary/20 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer group"
                                >
                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <span className="material-symbols-outlined text-primary text-2xl">cloud_upload</span>
                                    </div>
                                    <div>
                                        <h3 className="text-text-main-light dark:text-text-main-dark font-semibold">{translations.employeeDashboard.syncProfile}</h3>
                                        <p className="text-sub-light dark:text-sub-dark text-sm mt-1">{translations.employeeDashboard.syncProfileSubtitle}</p>
                                    </div>
                                </div>

                                <CertificationsTable 
                                    certifications={filteredCerts}
                                    loading={loading}
                                    getStatusColorClass={getStatusColorClass}
                                />
                            </div>

                            {/* Sidebar Right - AI Advisory */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-gradient-to-br from-surface-dark to-background-dark rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-20 rotate-12">
                                        <span className="material-symbols-outlined text-[120px] text-primary">auto_awesome</span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="material-symbols-outlined text-accent-yellow">auto_awesome</span>
                                            <h3 className="font-bold text-lg">{translations.employeeDashboard.aiCareerPath}</h3>
                                        </div>
                                        <p className="text-sub-dark text-sm mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: translations.employeeDashboard.aiCareerPathSubtitle }}></p>
                                        <button className="w-full mt-6 py-2 bg-surface-light text-text-main-light rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                                            {translations.employeeDashboard.exploreRoadmap}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Certification Modal */}
                <AddNewCertificationModal 
                    isOpen={state.showUploadModal} 
                    onClose={() => updateState({ showUploadModal: false })} 
                />

            </main>
        </div>
    );
};

EmployeeDashboardComponent.displayName = "EmployeeDashboard";

export default connector(EmployeeDashboardComponent);
