/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                bukizz: {
                    blue: '#2874F0',
                    'blue-light': '#E8F0FE',
                    orange: '#FF6B00',
                    'orange-light': '#FFF3E6',
                    dark: '#1A1A2E',
                    gray: '#F5F5F5',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
