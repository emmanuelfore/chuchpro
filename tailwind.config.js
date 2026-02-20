/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                secondary: {
                    DEFAULT: '#ec4899',
                    dark: '#db2777',
                    light: '#f472b6',
                },
                background: '#0f172a',
                surface: 'rgba(30, 41, 59, 0.7)',
            },
            backgroundImage: {
                'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            }
        },
    },
    plugins: [],
}
