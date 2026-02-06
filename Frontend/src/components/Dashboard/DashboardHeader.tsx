import React from 'react';
import translations from '../../locales/en/common.json';

interface DashboardHeaderProps {
    filter: string;
    updateFilter: (filter: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filter, updateFilter }) => {
    return (
        <header className="flex-shrink-0 h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-muted-light dark:text-text-muted-dark text-xl">search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-text-main-light dark:text-text-main-dark placeholder-text-muted-light dark:placeholder-text-muted-dark focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all"
                        placeholder={translations.dashboardHeader.searchPlaceholder}
                        type="text"
                        value={filter}
                        onChange={(e) => updateFilter(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button className="px-4 py-1.5 rounded-md bg-white dark:bg-slate-700 shadow-sm text-xs font-semibold text-text-main-light dark:text-text-main-dark">{translations.dashboardHeader.employeeButton}</button>
                </div>
                <button className="relative p-2 text-text-muted-light dark:text-text-muted-dark hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;