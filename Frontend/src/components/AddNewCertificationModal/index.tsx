
import React, { useState, useCallback } from 'react';

interface AddNewCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddNewCertificationModal: React.FC<AddNewCertificationModalProps> = ({ isOpen, onClose }) => {
  const [isExpiryDisabled, setIsExpiryDisabled] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName(null);
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-accent-navy/20 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      role="dialog"
    >
      <div className="relative w-full max-w-3xl flex flex-col bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 max-h-[90vh] overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-border-dark bg-surface-light dark:bg-surface-dark sticky top-0 z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-navy/10 text-accent-navy dark:bg-primary/20 dark:text-primary">
                CertTracker
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main-light dark:text-white">
              Add New Certification
            </h2>
            <p className="text-text-sub-light dark:text-text-sub-dark text-sm">
              Enter the details below to add a credential to your profile.
            </p>
          </div>
          <button
            className="group rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            type="button"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300">
              close
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
          <div className="space-y-6">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main-light dark:text-gray-200" htmlFor="cert-name">
                  Certification Name
                </label>
                <input
                  className="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 p-3.5 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light/70 dark:placeholder:text-text-sub-dark/50 focus:border-accent-navy focus:ring-1 focus:ring-accent-yellow sm:text-sm transition-all"
                  id="cert-name"
                  placeholder="e.g. AWS Certified Solutions Architect"
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-text-main-light dark:text-gray-200" htmlFor="vendor">
                  Issuing Organization / Vendor
                </label>
                <div className="relative">
                  <select
                    className="form-select block w-full appearance-none rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 p-3.5 pr-10 text-base text-text-main-light dark:text-white focus:border-accent-navy focus:ring-1 focus:ring-accent-yellow sm:text-sm transition-all"
                    id="vendor"
                    defaultValue=""
                  >
                    <option disabled value="">
                      Select a vendor
                    </option>
                    <option value="aws">Amazon Web Services (AWS)</option>
                    <option value="google">Google Cloud</option>
                    <option value="microsoft">Microsoft Azure</option>
                    <option value="cisco">Cisco</option>
                    <option value="comptia">CompTIA</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-sub-light dark:text-text-sub-dark">
                    <span className="material-symbols-outlined text-xl">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main-light dark:text-gray-200" htmlFor="issue-date">
                  Issue Date
                </label>
                <div className="relative">
                  <input
                    className="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 p-3.5 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light/70 focus:border-accent-navy focus:ring-1 focus:ring-accent-yellow sm:text-sm [color-scheme:light] dark:[color-scheme:dark] transition-all"
                    id="issue-date"
                    type="date"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-main-light dark:text-gray-200" htmlFor="expiry-date">
                  Expiry Date
                </label>
                <div className="relative">
                  <input
                    className="form-input block w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-black/20 p-3.5 text-base text-text-main-light dark:text-white placeholder:text-text-sub-light/70 focus:border-accent-navy focus:ring-1 focus:ring-accent-yellow sm:text-sm [color-scheme:light] dark:[color-scheme:dark] transition-all"
                    id="expiry-date"
                    type="date"
                    disabled={isExpiryDisabled}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-navy/10 dark:bg-primary/10 text-accent-navy dark:text-primary">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-main-light dark:text-white">Credential never expires</span>
                  <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Disable expiry date validation</span>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  className="peer sr-only"
                  type="checkbox"
                  checked={isExpiryDisabled}
                  onChange={() => setIsExpiryDisabled(!isExpiryDisabled)}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-600 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent-navy peer-checked:after:translate-x-full peer-checked:after:border-accent-yellow peer-checked:after:bg-accent-yellow peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-yellow/50"></div>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-text-main-light dark:text-gray-200">
                Upload Certificate Copy
              </label>
              <div className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light dark:border-border-dark bg-background-light/30 dark:bg-white/5 py-8 transition-colors hover:bg-background-light dark:hover:bg-white/10 hover:border-accent-navy/50">
                <div className="flex flex-col items-center justify-center gap-3 pb-2 pt-3 text-center">
                  <div className="rounded-full bg-white p-3 shadow-sm dark:bg-surface-dark dark:shadow-none ring-1 ring-gray-200 dark:ring-gray-700">
                    <span className="material-symbols-outlined text-2xl text-primary">cloud_upload</span>
                  </div>
                  <div className="space-y-1">
                    {fileName ? (
                      <p className="text-sm font-medium text-text-main-light dark:text-white">{fileName}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-text-main-light dark:text-white">
                          <span className="text-accent-navy dark:text-primary hover:underline font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
                          PDF, JPG or PNG (max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  id="dropzone-file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 py-5 sticky bottom-0 z-10">
          <button
            className="rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-transparent px-5 py-2.5 text-sm font-medium text-text-main-light dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-text shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all flex items-center gap-2"
            type="button"
          >
            <span>Submit for Review</span>
            <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewCertificationModal;
