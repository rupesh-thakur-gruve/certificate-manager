
import React from 'react';
import translations from '../../locales/en/common.json';

interface User {
    name: string;
    email: string;
}

interface UserData {
    user: User;
}

interface SidebarProps {
    activeView: "dashboard" | "certifications" | "career" | "learning";
    setActiveView: (view: "dashboard" | "certifications" | "career" | "learning") => void;
    handleLogout: () => void;
    userData: UserData | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, handleLogout, userData }) => {
    return (
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark justify-between transition-colors duration-200">
            <div className="flex flex-col gap-6 p-6">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight">{translations.branding.appName}</h1>
                        <p className="text-text-muted-light dark:text-text-muted-dark text-xs font-medium">{translations.branding.appSubtitle}</p>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    <button onClick={() => setActiveView("dashboard")} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${activeView === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-text-muted-light dark:text-text-muted-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main-light dark:hover:text-text-main-dark'}`}>
                        <span className={`material-symbols-outlined ${activeView === 'dashboard' ? 'fill' : ''}`}>dashboard</span>
                        {translations.sidebar.dashboard}
                    </button>
                    <button onClick={() => setActiveView("certifications")} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${activeView === 'certifications' ? 'bg-primary/10 text-primary' : 'text-text-muted-light dark:text-text-muted-dark hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main-light dark:hover:text-text-main-dark'}`}>
                        <span className="material-symbols-outlined">workspace_premium</span>
                        {translations.sidebar.myCertifications}
                    </button>
                </nav>
            </div>
            <div className="p-6">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark font-medium transition-colors w-full text-left" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    {translations.sidebar.logout}
                </button>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                        {userData?.user.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">{userData?.user.name}</span>
                        <span className="text-xs text-text-muted-light dark:text-text-muted-dark">{userData?.user.email}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
