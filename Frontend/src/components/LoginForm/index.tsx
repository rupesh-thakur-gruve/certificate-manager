/**
 * Login Form Component.
 * Refactored to use Tailwind CSS split-screen design.
 */

import React, { memo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../apis/APICalls";
import { useCrossTabAuth } from "../../hooks/useCrossTabAuth";
import { setUserData } from "../../modules/appReducer";
import { CertTrackerLogo } from "../../utils/SVGIcons";
import translations from "../../locales/en/common.json";
import { AxiosError } from "axios";

interface LoginFormInputs {
    email: string;
    password: string;
}

const LoginForm: React.FC = memo(() => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { handleLogin } = useCrossTabAuth();

    const [state, setState] = useState({
        isLoading: false,
        error: null as string | null,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setState({ isLoading: true, error: null });

        try {
            const response = await login(data.email, data.password);

            // Store token for cross-tab auth
            handleLogin(response.data.access_token);

            // Store user data in Redux
            dispatch(setUserData(response.data));

            // Navigate based on role
            if (response.data.user.role === "manager") {
                navigate("/manager-dashboard");
            } else {
                navigate("/employee-dashboard");
            }
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            setState({
                isLoading: false,
                error: error.response?.data?.detail || translations.errors.loginFailed,
            });
        }
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark overflow-hidden font-display">
            {/* Left Panel: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between bg-surface-light dark:bg-surface-dark h-full relative z-10 overflow-y-auto">
                {/* Header Logo Area */}
                <div className="px-8 pt-8 lg:px-12 lg:pt-12">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="size-8">
                            <CertTrackerLogo />
                        </div>
                    </div>
                    <span className="text-text-main-light dark:text-text-main-dark text-xl font-bold tracking-tight">{translations.branding.appName}</span>
                </div>

                {/* Login Container */}
                <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-24">
                    <div className="w-full max-w-md space-y-8">
                        {/* Headings */}
                        <div className="text-left space-y-2">
                            <h1 className="text-3xl lg:text-4xl font-black text-text-main-light dark:text-text-main-dark tracking-tight">
                                {translations.login.title}
                            </h1>
                            <p className="text-sub-light dark:text-sub-dark text-base">
                                {translations.login.subtitle}
                            </p>
                        </div>

                        {/* Error Alert */}
                        {state.error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm" role="alert">
                                {state.error}
                            </div>
                        )}

                        {/* SSO Button */}
                        <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-surface-dark/50 transition-colors group" type="button">
                            <span className="material-symbols-outlined text-primary group-hover:scale-105 transition-transform">
                                domain
                            </span>
                            <span className="text-primary font-semibold text-sm">{translations.login.ssoButton}</span>
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center">
                            <div className="grow border-t border-border-light dark:border-border-dark"></div>
                            <span className="shrink-0 mx-4 text-sub-light dark:text-sub-dark text-sm font-medium">{translations.login.divider}</span>
                            <div className="grow border-t border-border-light dark:border-border-dark"></div>
                        </div>

                        {/* Form */}
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-text-main-light dark:text-text-main-dark" htmlFor="email">
                                    {translations.login.emailLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sub-light dark:text-sub-dark">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border-light dark:border-border-dark focus:ring-accent-yellow focus:border-primary'} rounded-lg text-text-main-light dark:text-text-main-dark bg-surface-light dark:bg-surface-dark placeholder:text-sub-light focus:ring-2 transition duration-150 ease-in-out sm:text-sm`}
                                        id="email"
                                        type="email"
                                        placeholder={translations.login.emailPlaceholder}
                                        disabled={state.isLoading}
                                        {...register("email", {
                                            required: translations.errors.emailRequired,
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: translations.errors.invalidEmail,
                                            }
                                        })}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-text-main-light dark:text-text-main-dark" htmlFor="password">
                                        {translations.login.passwordLabel}
                                    </label>
                                    <a className="text-sm font-medium text-primary hover:text-primary-hover transition-colors" href="#">
                                        {translations.login.forgotPassword}
                                    </a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sub-light dark:text-sub-dark">
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                    </div>
                                    <input
                                        className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border-light dark:border-border-dark focus:ring-accent-yellow focus:border-primary'} rounded-lg text-text-main-light dark:text-text-main-dark bg-surface-light dark:bg-surface-dark placeholder:text-sub-light focus:ring-2 transition duration-150 ease-in-out sm:text-sm`}
                                        id="password"
                                        type="password"
                                        placeholder={translations.login.passwordPlaceholder}
                                        disabled={state.isLoading}
                                        {...register("password", {
                                            required: translations.errors.passwordRequired,
                                            minLength: {
                                                value: 8,
                                                message: translations.errors.passwordMinLength,
                                            }
                                        })}
                                    />
                                    {/* Visibility toggle could go here, omitting for simplicity unless requested */}
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-text bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={state.isLoading}
                            >
                                {state.isLoading ? (
                                    <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                                ) : (
                                    translations.login.signInButton
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Area */}
                <div className="px-8 pb-8 lg:px-12 lg:pb-12 text-center">
                    <p className="text-sm text-sub-light dark:text-sub-dark">
                        {translations.login.footerText}
                        <a className="font-semibold text-primary hover:text-primary-hover transition-colors ml-1" href="#">
                            {translations.login.footerLink}
                        </a>
                    </p>
                </div>
            </div>

            {/* Right Panel: Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-background-dark overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Abstract geometric pattern"
                        className="h-full w-full object-cover opacity-60 mix-blend-overlay"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9xDXV4mvJX7f3brHNaj2PvrE7aaMrodOMkk2nM8Yvw5ZpTJiNgwfGDUZEfMkE5UWPLleBWvo1KGUue-M_IQnhp7EXZgeKnuuLRu91xbdCHPZTF9WMHLcp9z1WgAuDE5smvG-vht6SWiC901lwNeRgKllZx5Obk2xpjCbfnALZVcaXCMpU34zeQYkR4S2PKHB6UmfPbyNy51Za1PNxTFINyhCI1Izl0A9T99xSONAR1CVxdkQJ3KFUIHnuTl7yKZH-zY70FnFXjpM"
                    />
                    {/* Gradient Overlay for Brand tint */}
                    <div className="absolute inset-0 bg-linear-to-br from-background-dark/90 via-background-dark/40 to-primary/30 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-background-dark via-transparent to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-end p-16 h-full w-full max-w-3xl mx-auto">
                    <div className="space-y-6">
                        {/* Icon/Badge */}
                        <div className="inline-flex items-center justify-center size-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
                            <span className="material-symbols-outlined text-text-main-dark text-2xl">verified_user</span>
                        </div>
                        <blockquote className="space-y-4">
                            <p className="text-2xl font-medium text-text-main-dark leading-relaxed">
                                {translations.loginPage.quote}
                            </p>
                            <footer className="text-sm font-medium text-sub-dark">
                                {translations.loginPage.quoteAuthor}
                            </footer>
                        </blockquote>
                        {/* Decorative Dots */}
                        <div className="flex gap-2 pt-4">
                            <div className="w-8 h-1 bg-white rounded-full"></div>
                            <div className="w-2 h-1 bg-white/30 rounded-full"></div>
                            <div className="w-2 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
});

LoginForm.displayName = "LoginForm";

export default LoginForm;
