/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ccff00",
                "primary-hover": "#b3e600",
                "primary-text": "#002147",
                "accent-yellow": "#ffea00",
                "accent-orange": "#ffae42",
                "background-light": "#f8f9fa",
                "background-dark": "#0b1120",
                "surface-light": "#ffffff",
                "surface-dark": "#162032",
                "border-light": "#e2e8f0",
                "border-dark": "#2d3748",
                "text-main-light": "#0f172a",
                "text-main-dark": "#f1f5f9",
                "text-sub-light": "#64748b",
                "text-sub-dark": "#94a3b8",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"],
            },
            borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'glow': '0 0 15px rgba(204, 255, 0, 0.15)',
            }
        },
    },
    plugins: [],
};