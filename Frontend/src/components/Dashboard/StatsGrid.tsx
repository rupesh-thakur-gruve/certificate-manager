import React from 'react';
import translations from '../../locales/en/common.json';

interface StatsGridProps {
    stats: {
        active: number;
        expiring: number;
        complianceScore: number;
    };
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-primary">verified</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{translations.statsGrid.activeCertifications}</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.active}</span>
                    <span className="text-sm font-medium text-primary mb-1 flex items-center">
                        <span className="material-symbols-outlined text-base">arrow_upward</span> {translations.statsGrid.new}
                    </span>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-slate-500">warning</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{translations.statsGrid.expiringSoon}</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.expiring}</span>
                    <span className="text-sm font-medium text-slate-500 mb-1">
                        {translations.statsGrid.urgent}
                    </span>
                </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-slate-500">analytics</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{translations.statsGrid.complianceScore}</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.complianceScore}%</span>
                    <div className="w-full max-w-[100px] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-2 ml-2 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${stats.complianceScore}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;