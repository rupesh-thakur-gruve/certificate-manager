import React from 'react';
import translations from '../../locales/en/common.json';

interface Certification {
    id: number;
    certification_name: string;
    vendor_oem: string;
    expiry_date: string | null;
    status: string;
}

interface CertificationsTableProps {
    certifications: Certification[];
    loading: boolean;
    getStatusColorClass: (status: string) => string;
}

const CertificationsTable: React.FC<CertificationsTableProps> = ({ certifications, loading, getStatusColorClass }) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white">{translations.certificationsTable.title}</h3>
                <button className="text-primary text-sm font-medium hover:underline">{translations.certificationsTable.viewAll}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-6 py-3 font-semibold">{translations.certificationsTable.certificationName}</th>
                            <th className="px-6 py-3 font-semibold">{translations.certificationsTable.issuingOrg}</th>
                            <th className="px-6 py-3 font-semibold">{translations.certificationsTable.expiryDate}</th>
                            <th className="px-6 py-3 font-semibold">{translations.certificationsTable.status}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">{translations.certificationsTable.loading}</td></tr>
                        ) : certifications.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center">{translations.certificationsTable.noCertsFound}</td></tr>
                        ) : (
                            certifications.map((cert) => (
                                <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cert.certification_name}</td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cert.vendor_oem}</td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{cert.expiry_date || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(cert.status)}`}>
                                            {cert.status === "in_progress" ? translations.certificationsTable.pending : cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CertificationsTable;