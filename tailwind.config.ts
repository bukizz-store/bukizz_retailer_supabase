import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bukizz Brand Colors
        bukizz: {
          blue: '#2874F0',
          'blue-dark': '#1F5FD9',
          'blue-light': '#E8F0FE',
          yellow: '#FFE500',
          'yellow-dark': '#F5D800',
          orange: '#FF9F00',
          green: '#26A541',
          'green-light': '#E8F5EA',
        },
        // Text colors
        'text-primary': '#212121',
        'text-secondary': '#878787',
        'text-muted': '#ABABAB',
        // Background colors
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
